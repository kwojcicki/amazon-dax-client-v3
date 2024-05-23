import { dynamoDBClientExamples } from './dynamoDBClient.js';
import { dynamoDBDocumentClientExamples } from './dynamoDBDocumentClient.js';

export const handler = async (event, context) => {
    console.log(process.env.dax);
    await dynamoDBClientExamples();
    await dynamoDBDocumentClientExamples();
    return "ok";
};

