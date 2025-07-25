import { DaxDocument } from '@amazon-dax-sdk/lib-dax';


export const officialDaxClientExamples = async () => {
    let id = Date.now();

    const daxClient = new DaxDocument({
        endpoint: process.env.dax,
        region: 'us-east-2',
    });

    const getExample = async () => {
        console.log("Starting official dax client getExample");
        id++;

        const getItem = {
            TableName: 'test',
            Key: {
                "CommonName": `${id}`
            }
        };

        // @ts-ignore
        const resp = await daxClient.get(getItem);

        console.log("official dax client response");
        console.log(JSON.stringify(resp));
    }

    await getExample();
};

