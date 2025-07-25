# Amazon DAX Client for JavaScript AWS sdk-v3

~~The official version of [amazon-dax-client](https://www.npmjs.com/package/amazon-dax-client) does not work with AWS's javascript sdk-v3.~~

[As of 2025/03/18](https://aws.amazon.com/about-aws/whats-new/2025/03/amazon-dynamodb-accelerator-dax-sdk-javascript-version-3-available/) AWS released a DAX client that does work with AWS's JS SDK v3, available [here](https://www.npmjs.com/package/@amazon-dax-sdk/lib-dax?activeTab=readme) with official example usage [here](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DAX.client.run-application-nodejs-3-migrating.html).

However the official client has some [limitations](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DAX.client.run-application-nodejs-3.html#DAX.client.run-application-nodejs-3-not-in-parity), namely the inability to support the bare-bones client.

This repo holds a port of the v2 DAX library (which supports the bare-bones client as well). 

~~- https://github.com/aws/aws-sdk/issues/232~~
~~- https://github.com/aws/aws-sdk-js-v3/issues/3687~~
~~- https://repost.aws/questions/QUW2_4tPQMRritkjQkytT_cA/how-to-use-js-sdk-v3-to-getitem-from-dax-aws-sdk-client-dax-instead-of-amazon-dax-client~~
~~- https://github.com/aws/aws-sdk-js-v3/issues/4263~~
~~- https://stackoverflow.com/questions/71319371/amazon-dynamodb-dax-support-for-aws-sdk-for-javascript-v3~~

~~This is a port of the library that works with sdk-v3.~~

## Installing
The Amazon DAX client only runs from NodeJS, and can be installed using npm:
```sh
npm install amazon-dax-client-sdkv3
```

https://www.npmjs.com/package/amazon-dax-client-sdkv3

## Usage and Getting Started

### Using Document Client
```javascript
import AmazonDaxClient from "amazon-dax-client-sdkv3";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const documentDaxClient = new AmazonDaxClient({
    client: DynamoDBDocumentClient.from(new DynamoDBClient({
        endpoint: process.env.dax,
        region: 'us-east-2'
    }))
});

const putItem = new PutCommand({
    TableName: 'test',
    Item: {
        CommonName: `${id}`
    }
});

await documentDaxClient.send(putItem);
```

### Using Low Level Client
```javascript
import AmazonDaxClient from "amazon-dax-client-sdkv3";
import { GetItemCommand } from "@aws-sdk/client-dynamodb";

const daxEndpoint = process.env.dax;
const lowLevelDaxClient = new AmazonDaxClient({
    client: new DynamoDBClient({
        region: 'us-east-1',
        endpoint: daxEndpoint
    })
});

const params = {
    TableName: 'test',
    Key: {
        CommonName: { S: 'example-id' }
    }
};

const getItemCommand = new GetItemCommand(params);
const response = await daxClient.send(getItemCommand);
console.log(response.Item);
```

You can see more examples under the [test folder](https://github.com/kwojcicki/amazon-dax-client-v3/tree/main/test)