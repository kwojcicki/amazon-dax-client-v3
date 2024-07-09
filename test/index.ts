import { dynamoDBClientExamples } from './dynamoDBClient';
import { dynamoDBDocumentClientExamples } from './dynamoDBDocumentClient';
// import { loadTests } from './loadTests';

export const handler = async (_event: any, _context: any) => {
    console.log(process.env.dax);
    // await loadTests();
    await dynamoDBClientExamples();
    await dynamoDBDocumentClientExamples();
    return "ok";
};

