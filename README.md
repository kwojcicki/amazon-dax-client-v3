# Amazon DAX Client for JavaScript AWS sdk-v3

The official version of [amazon-dax-client](https://www.npmjs.com/package/amazon-dax-client) does not work with AWS's javascript sdk-v3.

- https://github.com/aws/aws-sdk/issues/232
- https://github.com/aws/aws-sdk-js-v3/issues/3687
- https://repost.aws/questions/QUW2_4tPQMRritkjQkytT_cA/how-to-use-js-sdk-v3-to-getitem-from-dax-aws-sdk-client-dax-instead-of-amazon-dax-client
- https://github.com/aws/aws-sdk-js-v3/issues/4263
- https://stackoverflow.com/questions/71319371/amazon-dynamodb-dax-support-for-aws-sdk-for-javascript-v3

This is a port of the library that works with sdk-v3.

## Installing
The Amazon DAX client only runs from NodeJS, and can be installed using npm:
```sh
npm install amazon-dax-client-sdkv3
```

https://www.npmjs.com/package/amazon-dax-client-sdkv3

## Usage and Getting Started

```javascript
import AmazonDaxClient from "amazon-dax-client";
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

You can see more examples under the [test folder](https://github.com/kwojcicki/amazon-dax-client-v3/tree/main/test)