import {DynamoAdapter} from '../util/dynamo-adapter.js';
import {UserRepo} from './user.repo.js';
import {User, UserAccount, FederatedAccount, RefreshToken, UserAccountDAO, FederatedAccountDAO, RefreshTokenDAO, FederatedAccountType} from '../../entities/user.js';

import { unmarshall } from "@aws-sdk/util-dynamodb";

class DynamoUserRepo implements UserRepo {
    #dynamoAdapter = new DynamoAdapter();

    async deleteRefreshToken(refreshToken: RefreshToken): Promise<void> {
        console.log(`Deleting refresh token for user: ${refreshToken.userId}`);

        const refreshTokenDo = refreshToken.toDO();
        const params = {
            TableName: "daedalus-users",
            Key: {
                'PK': refreshTokenDo.PK,
                'SK': refreshTokenDo.SK
            }
        }

        try {
            await this.#dynamoAdapter.deleteForParams(params);
        }
        catch(e) { 
            throw new Error(`Error: Unable to delete refresh token for user ${refreshToken.userId}`); }
    }

    async addRefreshToken(refreshToken: RefreshToken): Promise<void> {
        console.log(`Adding refresh token for user: ${refreshToken.userId}`);

        try {
            await this.addObject(refreshToken.toDO());
        }
        catch(e) { 
            throw new Error(`Error: Unable to add refresh token for user ${refreshToken.userId}`); }
    }

    async addUser(user: User): Promise<void>{
        console.log(`Adding user: ${user.userAccount.userId}`);

        try {
            await this.addObject(user.userAccount.toDO());
            await this.addObject(user.federatedAccount.toDO());

            if (user.refreshToken)
                await this.addObject(user.refreshToken.toDO());
        }
        catch(e) { 
            throw new Error(`Error: Unable to add user ${user.userAccount.userId}`); }
    }

    async updateFederatedAccount(federatedAccount: FederatedAccount): Promise<void> {
        console.log(`Updating federated account for user: ${federatedAccount.userId}`);

        // Only token is mutable
        //
        const dataObject = federatedAccount.toDO();
        
        const params = {
            TableName: "daedalus-users",
            ExpressionAttributeNames: {
                '#token': 'token' },
            ExpressionAttributeValues: { ':token': dataObject.token },
            Key: { 
                PK: dataObject.PK, 
                SK: dataObject.SK },
            UpdateExpression: 'SET #token = :token'
        }

        try {
            await this.#dynamoAdapter.updateForParams(params);
        }
        catch(e) {
            console.log(e);

            throw new Error(`Error: Unable to update federated account for user ${federatedAccount.userId}`); }
    }

    async getUserForRefreshToken(refreshToken: string): Promise<User | undefined> {
        console.log(`Checking for a user for refresh token: ${refreshToken}`);

        const typedRefreshToken = "RT#" + refreshToken;

        const params = {
            TableName: "daedalus-users",
            IndexName: "daedalus-users-gsi1",
            ExpressionAttributeValues: {
                ':sk': typedRefreshToken
            },
            KeyConditionExpression: 'SK = :sk'
        }

        let result;
    
        try {
            // TODO: Handle timeout, e.g. no internet connection!
            //
            result = await this.#dynamoAdapter.queryDataForParams(params);
            if (!result || result.length <= 0)
                return undefined; 
        }
        catch (e) { 
            throw new Error(`Error: Unable to find a user for refresh token ${refreshToken}`);}
        
        return await this.getUserForId(result[0].PK.split('#')[1]);
    }

    async getUserForFederatedAccountId(
        federatedAccountId: string, 
        federatedAccountType: FederatedAccountType): Promise<User | undefined> {

        console.log(`Checking for a user for federated account type ${federatedAccountType} and Id: ${federatedAccountId}`);

        const typedFederatedAccount = federatedAccountType + '#' + federatedAccountId;
        const params = {
            TableName: "daedalus-users",
            IndexName: "daedalus-users-gsi1",
            ExpressionAttributeValues: {
                ':sk': typedFederatedAccount
            },
            KeyConditionExpression: 'SK = :sk'
        }
        
        let result;

        try {
            result = await this.#dynamoAdapter.queryDataForParams(params);
            
            if (!result || result.length <= 0)
                return undefined;
        }
        catch (e) {
            throw new Error("Error: Unable to retrive user for federated account"); }

        return await this.getUserForId(result[0].PK.split('#')[1]);
    }

    async getUserForId(userId: string): Promise<User | undefined> {
        console.log(`Retrieving user details: ${userId}`);

        const typedUserId = 'US#' + userId;
        const params = {
            TableName: "daedalus-users",
            ExpressionAttributeValues: {
                ':pk': typedUserId
            },
            KeyConditionExpression: 'PK = :pk'
        }
        
        let user: User;

        try {
            const result = await this.#dynamoAdapter.queryDataForParams(params);
            if (!result) 
                return undefined;

            let userAccount: UserAccount | undefined;
            let federatedAccount: FederatedAccount | undefined;
            let refreshToken: RefreshToken | undefined;

            result.forEach((dataObject) => {
                const objectType = dataObject.SK.split('#')[0];
                switch (objectType) {
                    case "US":
                        userAccount = UserAccount.fromDO(dataObject as UserAccountDAO);
                        break;

                    case "FA":
                        federatedAccount = FederatedAccount.fromDO(dataObject as FederatedAccountDAO);
                        break;

                    case "RT":
                        refreshToken = RefreshToken.fromDO(dataObject as RefreshTokenDAO);
                        break;
                }
            });

            if (!userAccount || !federatedAccount)
                return undefined;

            user = new User("", refreshToken, federatedAccount, userAccount);
        }
        catch(e) {
            throw new Error(`Error: Unable to fully retrieve user ${userId}`);}

        return user;
    }

    private async addObject(obj: any): Promise<void> {
        const params = {
            TableName: "daedalus-users",
            Item: {
                ...obj
            }
        }

        await this.#dynamoAdapter.addForParams(params);
    }
}

export {DynamoUserRepo}