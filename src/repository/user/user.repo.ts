import {FederatedAccount, FederatedAccountType, RefreshToken, User} from '../../entities/user.js';

interface UserRepo {
    deleteRefreshToken(refreshToken: RefreshToken): void
    addRefreshToken(refreshToken: RefreshToken): void
    addUser(user: User): void 
    updateFederatedAccount(federatedAccount: FederatedAccount): void
    
    getUserForRefreshToken(refreshToken: string): Promise<User | undefined> 
    getUserForFederatedAccountId(federatedAccountId: string, federatedAccountType: FederatedAccountType): Promise<User | undefined>
    getUserForId(userId: string): Promise<User | undefined>
}

export {UserRepo};