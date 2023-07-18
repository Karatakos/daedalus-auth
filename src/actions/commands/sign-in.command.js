import {Command, CommandHandler} from '../command.js';
import {FederatedAccount, RefreshToken, UserAccount, User, UserAccountStatus} from '../../entities/user.js';
import {UserRepo} from '../../repository/user.repo.js';
import {Jwt} from '../jwt.js';
import {v4 as uuid } from 'uuid';
import {generateUsername } from 'friendly-username-generator';
import {SecretsManager} from '../secrets-manager.js';
import {UserSignedInEvent} from '../../events/user-signed-in.event.js';
import {UserSignInUnauthorizedEvent, UserSignInUnauthorizedReason} from '../../events/user-sign-in-unauthorized.event.js';
import {EventBus} from '../../events/event-bus.js';

class SigninCmd extends Command {
    accountId;
    provider;
    token;

    constructor(accountId, provider, token, commandId) {
        super("", commandId);

        this.accountId = accountId;
        this.provider = provider;
        this.token = token;
    }
}

class Signin extends CommandHandler {
    constructor(repository, publisher, command) {
        super(repository, publisher, command);
    }

    async execute() {
        // TODO: Validate the god damn Steam user token

        try {
            // Check if a user account already exists
            // 
            let user = await this.repository.getUserForFederatedAccountId(
                this.command.accountId, 
                this.command.provider);
          
            if (user) {
                if (user.userAccount.status === UserAccountStatus.DISABLED) {
                    this.publisher.publish(
                        new UserSignInUnauthorizedEvent(
                            this.command.accountId, 
                            new Date().toJSON(), 
                            `User account ${user.userId} has been disabled.`,
                            UserSignInUnauthorizedReason.ACCOUNT_DISABLED,
                            this.command.commandId));

                    return;
                }

                if (user.refreshToken) {
                    // Exsiting token needs invalidating
                    this.repository.deleteRefreshToken(user.refreshToken);
                }

                // Update the Steam token in case we need it later
                //
                user.federatedAccount.token = this.command.token;
                this.repository.updateFederatedAccount(user.federatedAccount);
            }
            // We're going to create a user account for them
            //
            else {
                console.log("User doesn't exist so adding a new account.");

                user = new User();
                
                user.userAccount = new UserAccount();
                user.userAccount.userId = uuid();
                user.userAccount.username = generateUsername({
                        userHyphen: false,
                        useRandomNumber: true
                    });
                user.userAccount.policy = {
                    studio: "guid1",            // TODO: Studio memberships
                    capabilities: ['admin']
                }
                user.userAccount.status = UserAccountStatus.ENABLED;
                user.userAccount.createdOn = new Date();

                user.federatedAccount = new FederatedAccount();
                user.federatedAccount.userId = user.userAccount.userId;
                user.federatedAccount.accountId = this.command.accountId;
                user.federatedAccount.type = this.command.provider;
                user.federatedAccount.token = this.command.token;
                
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

            user.refreshToken = new RefreshToken();
            user.refreshToken.userId = user.userAccount.userId;
            user.refreshToken.token = signedRefreshToken;

            this.repository.addRefreshToken(user.refreshToken);

            // Finally, generate new access token
            //
            user.accessToken = Jwt.sign(
                SecretsManager.accessTokenSecret,
                {
                    userId: user.userAccount.userId, 
                    policy: user.userAccount.policy, 
                    exp: SecretsManager.createExpiry(SecretsManager.accessTokenTTLHours)});

            this.publisher.publish(
                new UserSignedInEvent(
                    this.command.accountId,
                    user.userAccount.userId,
                    new Date().toJSON(), 
                    user.refreshToken.token,
                    user.accessToken,
                    this.command.commandId));
        }
        catch (e) {
            this.publisher.publish(
                new UserSignInUnauthorizedEvent(
                    this.command.accountId, 
                    new Date().toJSON(), 
                    e.message,
                    UserSignInUnauthorizedReason.ERROR,
                    this.command.commandId));
        }       
    }
}

export {Signin, SigninCmd};
