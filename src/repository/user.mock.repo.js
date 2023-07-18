import {UserRepo} from './user.repo.js';
import {FederatedAccount, RefreshToken, UserAccount, User, UserAccountStatus} from '../entities/user.js';

class MockedUserRepo extends UserRepo {
    #users = [];
    
    constructor(mockedUsers) {
        super();

        this.#users = mockedUsers;
    }

    deleteRefreshToken(refreshToken) {
        console.log(`[Mock] Deleting refresh token for user: ${refreshToken.userId}`);

        // Nasty to mutate state but it's fine for test data
        this.#users = this.#users.filter((a) => {
            return a.SK != refreshToken.toDO().SK;
        });

        return true;
    }

    addRefreshToken(refreshToken) {
        console.log(`[Mock] Adding refresh token for user: ${refreshToken.userId}`);

        this.#users.push(refreshToken.toDO());

        return true;
    }

    addUser(user) {
        console.log(`[Mock] Adding user: ${user.userAccount.userId}`);

        this.#users.push(user.userAccount.toDO());
        this.#users.push(user.federatedAccount.toDO());
    
        // Optional
        //
        if (user.refreshToken)
            this.#users.push(user.refreshToken.toDO());

        return true;
    } 

    updateFederatedAccount(federatedAccount) {
        console.log(`[Mock] Updating federated account for user: ${federatedAccount.userId}`);
    
        let dataObject = federatedAccount.toDO();
        this.#users.forEach((a) => {
            if (a.PK === dataObject.PK && a.SK.split('#')[0] == 'FA') {
                a = dataObject;
                return;
            }
        });
    }

    getUserForRefreshToken(refreshToken) {
        console.log(`[Mock] Checking for a user for refresh token: ${refreshToken}`);

        let user;
        const typedRefreshToken = "RT#" + refreshToken;
        this.#users.forEach((a) => {
            if (a.SK === typedRefreshToken) {
                user = this.getUserForId(a.PK.split('#')[1]);
                return;
            }
        });

        return user;
    }

    getUserForFederatedAccountId(federatedAccountId, federatedAccountType) {
        console.log(`[Mock] Checking for a user for federated account type ${federatedAccountType} and Id: ${federatedAccountId}`);

        const typedFederatedAccount = federatedAccountType + '#' + federatedAccountId;
        let user;
        this.#users.forEach((a) => {
            if (a.SK === typedFederatedAccount) {
                user = this.getUserForId(a.PK.split('#')[1]);
                return;
            }
        });

        return user
    }

    getUserForId(userId) {
        console.log(`[Mock] Retrieving user details: ${userId}`);
        
        const typedUserId = 'US#' + userId;
        let accountDO = this.#users
            .filter(a => a.PK === typedUserId && a.SK === typedUserId)[0];

        let refreshTokenDO = this.#users
            .filter((a) => {   
                return a.PK === typedUserId && a.SK.split('#')[0] == 'RT';
            })[0];

        let federatedAccountDO = this.#users
            .filter((a) => {   
                return a.PK === typedUserId && a.SK.split('#')[0] == 'FA';
            })[0];

        let usr = new User();

        usr.federatedAccount = new FederatedAccount();
        usr.federatedAccount.fromDO(federatedAccountDO);

        usr.refreshToken = new RefreshToken();
        usr.refreshToken.fromDO(refreshTokenDO);

        usr.userAccount = new UserAccount();
        usr.userAccount.fromDO(accountDO);

        return usr;
    }
};

export {MockedUserRepo};
