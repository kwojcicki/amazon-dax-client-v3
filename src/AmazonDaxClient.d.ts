
import * as ddb from "@aws-sdk/client-dynamodb";
import * as libddb from "@aws-sdk/lib-dynamodb";
import { Client } from "@smithy/smithy-client";

// TODO: ideally we trim down the ServiceInputTypes and ServiceOutputTypes to what DAX allows
// but I don't know how to do that yet given the Client's 2nd and 3rd parameters seem to have to match exactly
// to the 4th and 5th parameters of the commands CommandImpl interface
export declare class AmazonDaxClient extends Client<any, ddb.ServiceInputTypes, ddb.ServiceOutputTypes, any> {
  constructor(props: {
    client: ddb.DynamoDBClient | libddb.DynamoDBDocumentClient,
    config?: {
      /**
       *  defaults to false
       *  */
      skipHostnameVerification?: boolean;
      /**
       * defaults to 60_000
       *  */
      requestTimeout?: number;
      /**
       * defaults to 1
       *  */
      maxRetries?: number;
      /**
       * defaults to maxRetries
       *  */
      writeRetries?: number;
      /**
       * defaults to maxRetries
       *  */
      readRetries?: number;
      /**
       * defaults to 7_000
       *  */
      maxRetryDelay?: number;
      /**
       * defaults to 10
       *  */
      maxPendingConnectsPerHost?: number;
      /**
       * defaults to 125
       *  */
      clusterUpdateThreshold?: number;
      /**
       * Using a relatively high default interval (4 seconds, a little less
       * than the leader timeout) for automatic background updates of the
       * cluster state. This prevents connection churn in the steady-state
       * for stable healthy clusters. Using too short of an interval ends up
       * being a scalability issue as it leaves many connections in TIME_WAIT
       * on the nodes as the number of clients increases.
       *  */
      clusterUpdateInterval?: number;
      /**
       * defaults to 10_000
       *  */
      connectTimeout?: number;
      /**
       * defaults to 60_000
       *  */
      healthCheckInterval?: number;
      /**
       * defaults to 1_000
       *  */
      healthCheckTimeout?: number;
      /**
       * defaults to 7_000
       *  */
      threadKeepAlive?: number;
    }
  });
  paginateScan: (config: { startingToken?: string | undefined, pageSize?: number | undefined }, input: libddb.ScanCommandInput, ...additionalArguments: any) => AsyncGenerator<libddb.ScanCommandOutput>;
  paginateQuery: (config: { startingToken?: string | undefined, pageSize?: number | undefined }, input: libddb.QueryCommandInput, ...additionalArguments: any) => AsyncGenerator<libddb.QueryCommandOutput>;
}

export default AmazonDaxClient;
