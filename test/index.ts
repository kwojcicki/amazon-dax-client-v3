import { dynamoDBClientExamples } from './dynamoDBClient';
import { dynamoDBDocumentClientExamples } from './dynamoDBDocumentClient';
import { officialDaxClientExamples } from './officialDaxClient';
// import { loadTests } from './loadTests';

export const handler = async (_event: any, _context: any) => {
    console.log(process.env.dax);
    await dynamoDBClientExamples();
    await dynamoDBDocumentClientExamples();
    await officialDaxClientExamples();
    return "ok";
};

