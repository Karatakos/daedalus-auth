import {DynamoAdapter} from './util/dynamo-adapter.js';
import {UserRepo} from './user.repo.js';
import {User, UserAccount, FederatedAccount, RefreshToken} from '../entities/user.js';

class DynamoUserRepo extends UserRepo {
    #dynamoAdapter = new DynamoAdapter();

    constructor() {
        super();
    }

    async deleteRefreshToken(refreshToken) {
        console.log(`Deleting refresh token for user: ${refreshToken.userId}`);

        let refreshTokenDo = refreshToken.toDO();
        const params = {
            TableName: "tsuke-users",
            Key: {
                'PK': refreshTokenDo.PK,
                'SK': refreshTokenDo.SK
            }
        }

        return await this.#dynamoAdapter.deleteForParams(params);
    }

    async addRefreshToken(refreshToken) {
        console.log(`Adding refresh token for user: ${refreshToken.userId}`);

        return await this.addObject(refreshToken.toDO());;
    }

    async addUser(user) {
        console.log(`Adding user: ${user.userAccount.userId}`);

        await this.addObject(user.userAccount.toDO());
        await this.addObject(user.federatedAccount.toDO());

        if (user.refreshToken)
            await this.addObject(user.refreshToken.toDO());

        return true;
    }

    async addObject(obj) {
        const params = {
            TableName: "tsuke-users",
            Item: {
                ...obj
            }
        }

        return await this.#dynamoAdapter.addForParams(params);
    }

    async updateFederatedAccount(federatedAccount) {
        console.log(`Updating federated account for user: ${federatedAccount.userId}`);

        // Only token is mutable
        //
        let dataObject = federatedAccount.toDO();
        
        const params = {
            TableName: "tsuke-users",
            ExpressionAttributeNames: {
                '#token': 'token'
            },
            ExpressionAttributeValues: {
                ':pk': dataObject.PK,
                ':sk': dataObject.SK,
                ':token': dataObject.token
            },
            KeyConditionExpression: 'PK = :pk and SK = :SK',
            UpdateExpression: 'SET #token = :token'
        }

        return await this.#dynamoAdapter.updateForParams(params);
    }

    async getUserForRefreshToken(refreshToken) {
        console.log(`Checking for a user for refresh token: ${refreshToken}`);

        const typedRefreshToken = "RT#" + refreshToken;

        const params = {
            TableName: "tsuke-users",
            IndexName: "tsuke-users-gsi1",
            ExpressionAttributeValues: {
                ':sk': typedRefreshToken
            },
            KeyConditionExpression: 'SK = :sk'
        }
        
        let user;

        let result = await this.#dynamoAdapter.queryDataForParams(params);
        if (result && result.length > 0)
            user = await this.getUserForId(result[0].PK.split('#')[1]);
        
        return user;
    }

    async getUserForFederatedAccountId(federatedAccountId, federatedAccountType) {
        console.log(`Checking for a user for federated account type ${federatedAccountType} and Id: ${federatedAccountId}`);

        const typedFederatedAccount = federatedAccountType + '#' + federatedAccountId;
        const params = {
            TableName: "tsuke-users",
            IndexName: "tsuke-users-gsi1",
            ExpressionAttributeValues: {
                ':sk': typedFederatedAccount
            },
            KeyConditionExpression: 'SK = :sk'
        }
        
        let user;
        let result = await this.#dynamoAdapter.queryDataForParams(params);
        
        if (result && result.length > 0)
            user = await this.getUserForId(result[0].PK.split('#')[1]);
        
        return user;
    }

    async getUserForId(userId) {
        console.log(`Retrieving user details: ${userId}`);

        const typedUserId = 'US#' + userId;
        const params = {
            TableName: "tsuke-users",
            ExpressionAttributeValues: {
                ':pk': typedUserId
            },
            KeyConditionExpression: 'PK = :pk'
        }
        
        let result = await this.#dynamoAdapter.queryDataForParams(params);

        let usr = new User();
        result.forEach((dataObject) => {
            let objectType = dataObject.SK.split('#')[0];
            switch (objectType) {
                case "US":
                    usr.userAccount = new UserAccount();
                    usr.userAccount.fromDO(dataObject);
                    break;
                case "FA":
                    usr.federatedAccount = new FederatedAccount();
                    usr.federatedAccount.fromDO(dataObject);
                    break;
                case "RT":
                    usr.refreshToken = new RefreshToken();
                    usr.refreshToken.fromDO(dataObject);
                    break;
            }
        });

        return usr;
    }
}

export {DynamoUserRepo}