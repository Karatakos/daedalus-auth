import {ICommand, ICommandHandler} from './command.js';
import {FederatedAccountType, FederatedAccount, RefreshToken, UserAccount, User, UserAccountStatus, UserAccountPolicy } from '../../entities/user.js';
import {UserRepo} from '../../repository/user/user.repo.js';
import {Jwt} from '../../util/jwt.js';
import {v4 as uuid } from 'uuid';
import { generateUsername } from 'friendly-username-generator';
import {SecretsManager} from '../../util/secrets-manager.js';
import {UserSignedInEvent} from '../../events/user-signed-in.event.js';
import {UserSignInUnauthorizedEvent, UserSignInUnauthorizedReason} from '../../events/user-sign-in-unauthorized.event.js';
import {EventBus} from '../../events/event-bus.js';

class SigninCmd implements ICommand {
    constructor(
        public readonly accountId: string, 
        public readonly provider: FederatedAccountType, 
        public readonly token: string, 
        public readonly commandId: string) {}
}

class SigninHandler implements ICommandHandler {
    constructor(
        public readonly repository: UserRepo, 
        public readonly publisher: EventBus) {}

    async execute(cmd: SigninCmd): Promise<void> {
        // TODO: Validate the god damn Steam user token

        try {
            // Check if a user account already exists
            // 
            let user = await this.repository.getUserForFederatedAccountId(
                cmd.accountId, 
                cmd.provider);
          
            if (user) {
                if (user.userAccount.status === UserAccountStatus.DISABLED) {
                    this.publisher.publish(
                        new UserSignInUnauthorizedEvent(
                            cmd.accountId, 
                            new Date().toJSON(), 
                            `User account ${user.userAccount.userId} has been disabled.`,
                            UserSignInUnauthorizedReason.ACCOUNT_DISABLED,
                            cmd.commandId));

                    return;
                }

                if (user.refreshToken) {
                    // Exsiting token needs invalidating
                    await this.repository.deleteRefreshToken(user.refreshToken);
                }

                // Update the Steam token if it has changed
                //
                if (user.federatedAccount.token != cmd.token) {
                    const updatedFederatedAccount = new FederatedAccount(
                        user.federatedAccount.userId,
                        user.federatedAccount.accountId,
                        user.federatedAccount.type,
                        cmd.token
                    )

                    user = new User(
                        user.accessToken,
                        user.refreshToken,
                        updatedFederatedAccount,
                        user.userAccount);

                    await this.repository.updateFederatedAccount(user.federatedAccount);
                }
            }
            // We're going to create a user account for them
            //
            else {
                console.log("User doesn't exist so adding a new account.");

                const userAccount = new UserAccount(
                    uuid(),
                    generateUsername({
                        useHyphen: false,
                        useRandomNumber: true }),
                    new UserAccountPolicy(
                        "guid1",            // TODO: Studio memberships
                        ['admin']),
                    UserAccountStatus.ENABLED);


                const federatedAccount = new FederatedAccount(
                    userAccount.userId,
                    cmd.accountId,
                    cmd.provider,
                    cmd.token);

                user = new User(
                    undefined,
                    undefined,
                    federatedAccount,
                    userAccount);
                
                this.repository.addUser(user);
            }

            // Generate new refresh token
            //
            const signedRefreshToken = Jwt.sign(
                SecretsManager.refreshTokenSecret,
                {
                    userId: user.userAccount.userId,
                    exp: SecretsManager.createExpiry(SecretsManager.refreshTokenTTLHours)
                });

            const refreshToken = new RefreshToken(
                user.userAccount.userId,
                signedRefreshToken
            );

            await this.repository.addRefreshToken(refreshToken);

            // Finally, generate new access token
            //
            const accessToken = Jwt.sign(
                SecretsManager.accessTokenSecret,
                {
                    userId: user.userAccount.userId, 
                    policy: user.userAccount.policy, 
                    exp: SecretsManager.createExpiry(SecretsManager.accessTokenTTLHours)});

            user = new User(
                accessToken,
                refreshToken,
                user.federatedAccount,
                user.userAccount);

            this.publisher.publish(
                new UserSignedInEvent(
                    cmd.accountId,
                    user.userAccount.userId,
                    new Date().toJSON(), 
                    user.refreshToken?.token,
                    user?.accessToken,
                    cmd.commandId));
        }
        catch (e) {
            const error = e as Error;

            this.publisher.publish(
                new UserSignInUnauthorizedEvent(
                    cmd.accountId, 
                    new Date().toJSON(), 
                    error.message,
                    UserSignInUnauthorizedReason.ERROR,
                    cmd.commandId));
        }       
    }
}

export {SigninHandler, SigninCmd};
