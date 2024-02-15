import { IQuery, IQueryHandler } from './query.js';
import { RefreshToken, UserAccountStatus } from '../../entities/user.js';
import { UserRepo } from '../../repository/user/user.repo.js';
import { User } from '../../entities/user.js';
import { Jwt } from '../../util/jwt.js';
import { SecretsManager } from '../../util/secrets-manager.js';

class AccessTokenQuery implements IQuery {
    constructor(public readonly refreshToken: string) {}
}

class AccessTokenHandler implements IQueryHandler<string> {
    constructor(private readonly repo: UserRepo ) {}

    async execute(query: AccessTokenQuery): Promise<string> {
        // Check if a user account already exists
        // 
        const user = await this.repo.getUserForRefreshToken(query.refreshToken);

        if (!user)
            throw new Error("Unauthorized. Refresh token not found, please sign-in again.");

        if (user.userAccount.status === UserAccountStatus.DISABLED) 
            throw new Error("Unauthorized. This account is disabled.");

        // Kind of a double verification but we need to check expiry
        //
        // Yes we could instead store expiry in the DB with the token
        // but then we would not need a JWT -- that works fine too.
        // 
        const refreshTokenPayload = Jwt.verify(SecretsManager.refreshTokenSecret, query.refreshToken);
        const timestamp = new Date(refreshTokenPayload.exp);
        if (timestamp.getTime() < new Date().getTime())
            throw new Error("Unauthorized. Refresh token expired.");
    
        // Finally, generate new access token
        //
        const token = Jwt.sign(
            SecretsManager.accessTokenSecret,
            {
                userId: user.userAccount.userId, 
                policy: user.userAccount.policy, 
                exp: SecretsManager.createExpiry(SecretsManager.accessTokenTTLHours)
            });

        return token;
    }
}

export { AccessTokenQuery, AccessTokenHandler };
