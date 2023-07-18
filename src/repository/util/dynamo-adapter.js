import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, QueryCommand, UpdateCommand, PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

class DynamoAdapter {
    #ddbClient;
    #ddbDocClient;
    #awsRegion;

    constructor(region = "ap-northeast-1") {
        this.#awsRegion = region;

        const marshallOptions = {
            convertEmptyValues: false,
            removeUndefinedValues: true,
            convertClassInstanceToMap: false
        };

        const unmarshallOptions = {
            wrapNumbers: false
        };

        const ddbTranslateConfig = {
            marshallOptions,
            unmarshallOptions
        };

        this.#ddbClient = new DynamoDBClient({ region: this.#awsRegion });
        this.#ddbDocClient = DynamoDBDocumentClient.from(this.#ddbClient, ddbTranslateConfig);
    }

    async addForParams(params) {
        return await this.#ddbDocClient.send(new PutCommand(params));
    }

    async deleteForParams(params) {
        return await this.#ddbDocClient.send(new DeleteCommand(params));
    }

    async updateForParams(params) {
        return await this.#ddbDocClient.send(new UpdateCommand(params));
    }

    async getDataForParams(params) {
        let result = await this.#ddbDocClient.send(new GetCommand(params));
        return result.Item;
    }

    async queryDataForParams(params) {
        let result = await this.#ddbDocClient.send(new QueryCommand(params));
        return result.Items;
    }
}

export {DynamoAdapter}