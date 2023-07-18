import {Query} from '../query.js';
import {RefreshToken, UserAccountStatus} from '../../entities/user.js';
import {UserRepo} from '../../repository/user.repo.js';
import {Jwt} from '../jwt.js';
import {SecretsManager} from '../secrets-manager.js';

class RefreshTokenQuery extends Query {
    #repo;

    constructor(repo) {
        super();
        
        this.#repo = repo;
    }

    async execute(refreshToken) {
        // Check if a user account already exists
        // 
        let user = await this.#repo.getUserForRefreshToken(refreshToken);

        if (!user)
            throw new Error("Unauthorized. Refresh token not found, please sign-in again.");

        if (user.userAccount.status === UserAccountStatus.DISABLED) 
            throw new Error("Unauthorized. This account is disabled.");

        // Kind of a double verification but we need to check expiry
        //
        // Yes we could instead store expiry in the DB with the token
        // but then we would not need a JWT -- that works fine too.
        // 
        const refreshTokenPayload = Jwt.verify(SecretsManager.refreshTokenSecret, refreshToken);
        const timestamp = new Date(refreshTokenPayload.exp);
        if (timestamp.getTime() < new Date().getTime())
            throw new Error("Unauthorized. Refresh token expired.");
    
        // Finally, generate new access token
        //
        user.accessToken = Jwt.sign(
            SecretsManager.accessTokenSecret,
            {
                userId: user.userAccount.userId, 
                policy: user.userAccount.policy, 
                exp: SecretsManager.createExpiry(SecretsManager.accessTokenTTLHours)
            });

        return user.accessToken;
    }
}

export {RefreshTokenQuery};
