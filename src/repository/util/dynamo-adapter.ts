import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, QueryCommand, UpdateCommand, PutCommand, DeleteCommand, DeleteCommandOutput, PutCommandOutput, UpdateCommandOutput } from '@aws-sdk/lib-dynamodb';

class DynamoAdapter {
    private readonly ddbClient: DynamoDBClient;
    private readonly ddbDocClient: DynamoDBDocumentClient;

    constructor(private readonly awsRegion = "ap-northeast-1") {

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

        this.ddbClient = new DynamoDBClient({ region: this.awsRegion });
        this.ddbDocClient = DynamoDBDocumentClient.from(this.ddbClient, ddbTranslateConfig);
    }

    async addForParams(params: any): Promise<PutCommandOutput> {
        return await this.ddbDocClient.send(new PutCommand(params));
    }

    async deleteForParams(params: any): Promise<DeleteCommandOutput> {
        return await this.ddbDocClient.send(new DeleteCommand(params));
    }

    async updateForParams(params: any): Promise<UpdateCommandOutput> {
        return await this.ddbDocClient.send(new UpdateCommand(params));
    }

    async getDataForParams(params: any): Promise<Record<string, any> | undefined> {
        const result = await this.ddbDocClient.send(new GetCommand(params));

        return result.Item;
    }

    async queryDataForParams(params: any): Promise<Record<string, any>[] | undefined> {
        const result = await this.ddbDocClient.send(new QueryCommand(params));

        return result.Items;
    }
}

export {DynamoAdapter}