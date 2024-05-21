import AmazonDaxClient from "amazon-dax-client";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

export const dynamoDBDocumentClientExamples = async () => {
    let id = Date.now();

    const realDynamoClient = new DynamoDBClient({});

    const documentDaxClient = new AmazonDaxClient({
        client: DynamoDBDocumentClient.from(new DynamoDBClient({
            endpoint: process.env.dax,
            region: 'us-east-2'
        }))
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
    }

    await putExample();
};

