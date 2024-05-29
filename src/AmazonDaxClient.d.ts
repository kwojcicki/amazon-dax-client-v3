
import * as ddb from "@aws-sdk/client-dynamodb";
import * as libddb from "@aws-sdk/lib-dynamodb";
import * as smithy from "@smithy/smithy-client"

declare class AmazonDaxClient extends smithy.Client<any, ddb.ServiceInputTypes | libddb.ServiceInputTypes, ddb.ServiceOutputTypes | libddb.ServiceOutputTypes, any> {
  constructor(props: { client: ddb.DynamoDBClient });
}

export = AmazonDaxClient;