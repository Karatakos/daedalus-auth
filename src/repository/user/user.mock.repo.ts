import {UserRepo} from './user.repo.js';
import {
    FederatedAccount, 
    RefreshToken, 
    UserAccount, 
    User,
    FederatedAccountType} from '../../entities/user.js';

class MockedUserRepo implements UserRepo {
    #datastore: any[];
    
    constructor(mockedDatastore: any[]) {
        this.#datastore = mockedDatastore;
    }

    async deleteRefreshToken(refreshToken: RefreshToken): Promise<void> {
        console.log(`[Mock] Deleting refresh token for user: ${refreshToken.userId}`);

        // Nasty to mutate state but it's fine for test data
        this.#datastore = this.#datastore.filter((a) => {
            return a.SK != refreshToken.toDO().SK;
        });
    }

    async addRefreshToken(refreshToken: RefreshToken): Promise<void> {
        console.log(`[Mock] Adding refresh token for user: ${refreshToken.userId}`);

        this.#datastore.push(refreshToken.toDO());
    }

    async addUser(user: User): Promise<void> {
        console.log(`[Mock] Adding user: ${user.userAccount.userId}`);

        this.#datastore.push(user.userAccount.toDO());
        this.#datastore.push(user.federatedAccount.toDO());
    
        // Optional
        //
        if (user.refreshToken)
            this.#datastore.push(user.refreshToken.toDO());
    } 

    async updateFederatedAccount(federatedAccount: FederatedAccount): Promise<void> { 
        console.log(`[Mock] Updating federated account for user: ${federatedAccount.userId}`);
    
        const dataObject = federatedAccount.toDO();
        this.#datastore.forEach((a) => {
            if (a.PK === dataObject.PK && a.SK.split('#')[0] == 'FA') {
                a = dataObject;
                return;
            }
        });
    }

    async getUserForRefreshToken(refreshToken: string): Promise<User | undefined> {
        console.log(`[Mock] Checking for a user for refresh token: ${refreshToken}`);

        let user;
        const typedRefreshToken = "RT#" + refreshToken;
        this.#datastore.forEach((a) => {
            if (a.SK === typedRefreshToken) {
                user = this.getUserForId(a.PK.split('#')[1]);
                return;
            }
        });

        return user;
    }

    async getUserForFederatedAccountId(
        federatedAccountId: string, 
        federatedAccountType: FederatedAccountType): Promise<User> {

        console.log(`[Mock] Checking for a user for federated account type ${federatedAccountType} and Id: ${federatedAccountId}`);

        const typedFederatedAccount = federatedAccountType + '#' + federatedAccountId;
        let user;
        this.#datastore.forEach((a) => {
            if (a.SK === typedFederatedAccount) {
                user = this.getUserForId(a.PK.split('#')[1]);
                return;
            }
        });

        return user
    }

    async getUserForId(userId: string): Promise<User | undefined> {
        console.log(`[Mock] Retrieving user details: ${userId}`);
        
        const typedUserId = 'US#' + userId;
        const accountDO = this.#datastore
            .filter(a => a.PK === typedUserId && a.SK === typedUserId)[0];

        const refreshTokenDO = this.#datastore
            .filter((a) => {   
                return a.PK === typedUserId && a.SK.split('#')[0] == 'RT';
            })[0];

        const federatedAccountDO = this.#datastore
            .filter((a) => {   
                return a.PK === typedUserId && a.SK.split('#')[0] == 'FA';
            })[0];

        return new User(
            "",
            RefreshToken.fromDO(refreshTokenDO),
            FederatedAccount.fromDO(federatedAccountDO),
            UserAccount.fromDO(accountDO));
    }
}

export {MockedUserRepo};
