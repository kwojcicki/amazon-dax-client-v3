import AmazonDaxClient from "amazon-dax-client";
import { DynamoDBClient, PutItemCommand, GetItemCommand } from "@aws-sdk/client-dynamodb";

export const dynamoDBClientExamples = async () => {
    let id = Date.now();

    const dynamoClient = new DynamoDBClient({});

    const daxClient = new AmazonDaxClient({
        client: new DynamoDBClient({
            endpoint: process.env.dax,
            region: 'us-east-2'
        })
    });

    const putExample = async () => {
        console.log("Starting putExample");
        id++;
        const putItem = new PutItemCommand({
            TableName: 'test',
            Item: {
                CommonName: {
                    "S": `${id}`,
                }
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

        await daxClient.send(putItem);

        const resp = await dynamoClient.send(getItem);
        console.log(JSON.stringify(resp));
    }

    const getExample = async () => {
        console.log("Starting getExample");
        id++;
        const putItem = new PutItemCommand({
            TableName: 'test',
            Item: {
                CommonName: {
                    "S": `${id}`,
                }
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

        await dynamoClient.send(putItem);

        const resp = await daxClient.send(getitem);

        console.log(JSON.stringify(resp));
    }

    await getExample();
    await putExample();
};

