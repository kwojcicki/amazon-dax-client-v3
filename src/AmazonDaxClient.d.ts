
import * as ddb from "@aws-sdk/client-dynamodb";
import * as libddb from "@aws-sdk/lib-dynamodb";
import * as smithyTypes from "@smithy/types";

type allowServiceInputTypes = ddb.BatchGetItemCommandInput |
  ddb.BatchWriteItemCommandInput |
  ddb.DeleteItemCommandInput |
  ddb.GetItemCommandInput |
  ddb.PutItemCommandInput |
  ddb.QueryCommandInput |
  ddb.ScanCommandInput |
  ddb.TransactGetItemsCommandInput |
  ddb.UpdateItemCommandInput |
  libddb.BatchGetCommandInput |
  libddb.BatchWriteCommandInput |
  libddb.DeleteCommandInput |
  libddb.GetCommandInput |
  libddb.PutCommandInput |
  libddb.QueryCommandInput |
  libddb.ScanCommandInput |
  libddb.TransactGetCommandInput |
  libddb.UpdateCommandInput

type allowedServiceOutputTypes = ddb.BatchGetItemCommandOutput |
  ddb.BatchWriteItemCommandOutput |
  ddb.DeleteItemCommandOutput |
  ddb.GetItemCommandOutput |
  ddb.PutItemCommandOutput |
  ddb.QueryCommandOutput |
  ddb.ScanCommandOutput |
  ddb.TransactGetItemsCommandOutput |
  ddb.UpdateItemCommandOutput |
  libddb.BatchGetCommandOutput |
  libddb.BatchWriteCommandOutput |
  libddb.DeleteCommandOutput |
  libddb.GetCommandOutput |
  libddb.PutCommandOutput |
  libddb.QueryCommandOutput |
  libddb.ScanCommandOutput |
  libddb.TransactGetCommandOutput |
  libddb.UpdateCommandOutput

export declare class Client<HandlerOptions, ClientInput extends object, ClientOutput extends MetadataBearer, ResolvedClientConfiguration extends SmithyResolvedConfiguration<HandlerOptions>> implements smithyTypes.Client<ClientInput, ClientOutput, ResolvedClientConfiguration> {
  middlewareStack: MiddlewareStack<ddb.ServiceInputTypes, ddb.ServiceOutputTypes>;
  readonly config: ResolvedClientConfiguration;
  constructor(config: ResolvedClientConfiguration);
  send<InputType extends ClientInput, OutputType extends ClientOutput>(command: smithyTypes.Command<ddb.ServiceInputTypes, InputType, ddb.ServiceOutputTypes, OutputType, SmithyResolvedConfiguration<HandlerOptions>>, options?: HandlerOptions): Promise<OutputType>;
  send<InputType extends ClientInput, OutputType extends ClientOutput>(command: smithyTypes.Command<ddb.ServiceInputTypes, InputType, ddb.ServiceOutputTypes, OutputType, SmithyResolvedConfiguration<HandlerOptions>>, cb: (err: any, data?: OutputType) => void): void;
  send<InputType extends ClientInput, OutputType extends ClientOutput>(command: smithyTypes.Command<ddb.ServiceInputTypes, InputType, ddb.ServiceOutputTypes, OutputType, SmithyResolvedConfiguration<HandlerOptions>>, options: HandlerOptions, cb: (err: any, data?: OutputType) => void): void;
  destroy(): void;
}

declare class AmazonDaxClient extends Client<any, allowServiceInputTypes, allowedServiceOutputTypes, any> {
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

export = AmazonDaxClient;