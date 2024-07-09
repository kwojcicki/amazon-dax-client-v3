import AmazonDaxClient from "amazon-dax-client-sdkv3";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

const expect = (x: any, y: any, errorMessage: string) => {
    if (x != y) throw new Error(`expected ${x} to be equal to ${y}, ${errorMessage}`);
}

export const dynamoDBDocumentClientExamples = async () => {
    let id = Date.now();

    const realDynamoClient = new DynamoDBClient({});

    const documentDaxClient = new AmazonDaxClient({
        client: DynamoDBDocumentClient.from(new DynamoDBClient({
            endpoint: process.env.dax,
            region: 'us-east-2'
        })),
        config: {
            connectTimeout: 10_001
        }
    });

    const putExample = async () => {
        console.log("Starting putExample with document client");
        id++;
        const putItem = new PutCommand({
            TableName: 'test',
            Item: {
                CommonName: `${id}`
            }
        });

        const getItem = new GetItemCommand({
            TableName: 'test',
            Key: {
                "CommonName": {
                    "S": `${id}`
                }
            }
        });

        await documentDaxClient.send(putItem);

        const resp = await realDynamoClient.send(getItem);
        console.log(JSON.stringify(resp));

        expect(resp.Item!["CommonName"]["S"], id, "documentClientPutTest");
    }

    const queryExample = async () => {
        console.log("Starting queryExample with document client");

        const scan = await documentDaxClient.send(new QueryCommand({
            TableName: 'test',
            KeyConditionExpression: 'CommonName = :id',
            ExpressionAttributeValues: {
                ':id': `${id}`
            }
        }));

        console.log(JSON.stringify(scan));
    }

    const scanExample = async () => {
        console.log("Starting scanExample with document client");

        const scan = await documentDaxClient.send(new ScanCommand({
            TableName: 'test'
        }));

        console.log(JSON.stringify(scan));
    }

    const paginateScanExample = async () => {
        console.log("Starting paginateScanExample with document client");

        const paginator = documentDaxClient.paginateScan({}, {
            TableName: 'test',
        });

        for await (const val of paginator) {
            console.log(val);
        };
    }

    const paginateQueryExample = async () => {
        console.log("Starting paginateQueryExample with document client");

        const paginator = documentDaxClient.paginateQuery({}, {
            TableName: 'test',
            KeyConditionExpression: 'CommonName = :id',
            ExpressionAttributeValues: {
                ':id': `${id}`
            }
        });

        for await (const val of paginator) {
            console.log(val);
        };
    }

    await putExample();
    await queryExample();
    await scanExample();
    await paginateScanExample();
    await paginateQueryExample();
};

