### DynamoDBDocumentClient

https://github.com/kwojcicki/amazon-dax-client-v3/blob/main/test/dynamoDBDocumentClient.js shows examples for using this library with DynamoDBDocumentClient.

High level example:

```javascript
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

### DynamoDBClient

https://github.com/kwojcicki/amazon-dax-client-v3/blob/main/test/dynamoDBClient.js shows examples for using this library with DynamoDBClient. 

```javascript

const daxClient = new AmazonDaxClient({
    client: new DynamoDBClient({
        endpoint: process.env.dax,
        region: 'us-east-2'
    })
});

const putItem = new PutItemCommand({
    TableName: 'test',
    Item: {
        CommonName: {
            "S": `${id}`,
        }
    }
});

await daxClient.send(putItem);
```