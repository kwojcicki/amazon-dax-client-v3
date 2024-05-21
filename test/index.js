import { dynamoDBClientExamples } from './dynamoDBClient';
import { dynamoDBDocumentClientExamples } from './dynamoDBDocumentClient';

export const handler = async (event, context) => {
    await dynamoDBClientExamples();
    await dynamoDBDocumentClientExamples();
    return "ok";
};

