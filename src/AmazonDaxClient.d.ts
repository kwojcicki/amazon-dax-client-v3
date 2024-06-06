
import * as ddb from "@aws-sdk/client-dynamodb";
import * as libddb from "@aws-sdk/lib-dynamodb";
import * as smithy from "@smithy/smithy-client"

declare class AmazonDaxClient extends smithy.Client<any, ddb.ServiceInputTypes | libddb.ServiceInputTypes, ddb.ServiceOutputTypes | libddb.ServiceOutputTypes, any> {
  constructor(props: { client: ddb.DynamoDBClient });
  paginateScan: (config: { startingToken: string | undefined, pageSize: number | undefined }, input: libddb.ScanCommandInput, ...additionalArguments: any) => AsyncGenerator<libddb.ScanCommandOutput>;
  paginateQuery: (config: { startingToken: string | undefined, pageSize: number | undefined }, input: libddb.QueryCommandInput, ...additionalArguments: any) => AsyncGenerator<libddb.QueryCommandOutput>;
}

export = AmazonDaxClient;