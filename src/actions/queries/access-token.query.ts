import { IQuery, IQueryHandler } from './query.js';
import { UserAccountStatus } from '../../entities/user.js';
import { UserRepo } from '../../repository/user/user.repo.js';
import { IJwksCache } from '../../util/jkws-paramstore-cache.js';
import { Config } from '../../util/config.js';

import jwt from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';


class AccessTokenQuery implements IQuery {
    constructor(public readonly refreshToken: string) {}
}

class AccessTokenHandler implements IQueryHandler<string> {
    constructor(
        private readonly repo: UserRepo,
        private readonly jwksCache: IJwksCache) {}

    async execute(query: AccessTokenQuery): Promise<string> {
        // Check if a user account already exists
        // 
        const user = await this.repo.getUserForRefreshToken(query.refreshToken);

        if (!user)
            throw new Error("Unauthorized. Refresh token not found, please sign-in again.");

        if (user.userAccount.status === UserAccountStatus.DISABLED) 
            throw new Error("Unauthorized. This account is disabled.");

        // Might be cleaner to util.promisify this
        // 
        await new Promise((resolve, reject) => {
            jwt.verify(
                query.refreshToken, 
                async (header, callback) => {
                    if (!header.kid)
                        reject("No kid found in token header so I don't know which key to use.");
                    else {
                        const key = await this.jwksCache.getVerificationKey(header.kid);
                        callback(null, jwkToPem(key)) 
                    }},
                (error, decoded) => {
                    if (error || !decoded)  
                        reject("Token invalid.");
                    
                    resolve(decoded);
                });
            });

        const key = await this.jwksCache.getSigningKey();

        const pem = jwkToPem(key, {private: true})
        const signingOptions: jwt.SignOptions = {
            algorithm: 'ES256',
            keyid: key.kid };

        // Finally, generate new access token
        //
        const token = jwt.sign(
            {
                userId: user.userAccount.userId, 
                policy: user.userAccount.policy,
                exp: Config.createExpiry(Config.accessTokenTTLHours) },
            pem,
            signingOptions);

        return token;  
    }
}

export { AccessTokenQuery, AccessTokenHandler };
