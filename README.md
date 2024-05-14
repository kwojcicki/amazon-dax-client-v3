# Amazon DAX Client for JavaScript

DAX is a DynamoDB-compatible caching service that enables you to benefit from fast in-memory performance for demanding applications.

This client library provides access from NodeJS to DAX.

## Installing
The Amazon DAX client only runs from NodeJS, and can be installed using npm:
```sh
npm install amazon-dax-client
```

## Usage and Getting Started
You can follow the Getting Started tutorial at:

https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DAX.client.sample-app.html

To quickly use DAX, replace `AWS.DynamoDB` with `AmazonDaxClient`:

```javascript
const AmazonDaxClient = require('amazon-dax-client');

// Replace this ...
const ddb = new AWS.DynamoDB({region: region});
/// with this ...
const endpoint = "your-cluster-discovery-endpoint";
const dax = new AmazonDaxClient({endpoints: [endpoint], region: region});

// If using AWS.DynamoDB.DocumentClient ...
const doc = new AWS.DynamoDB.DocumentClient({service: dax});
```

The DAX Cluster Discovery Endpoint can be found the AWS console or by using `aws dax describe-clusters` from the command line.

Creating a connection to your DAX cluster requires using the Cluster Discovery Endpoint URL returned in the DescribeClusters response as the endpoint.

For example:
```javascript
// Format: const endpoint = <ClusterDiscoveryEndpoint.URL>;
const endpoint = 'dax://my-cluster.abc123.dax-clusters.us-east-1.amazonaws.com';
```

## Getting Help
Please use these community resources for getting help.

 * Ask a question on [StackOverflow](https://stackoverflow.com/) and tag it with `amazon-dynamodb-dax`
 * Ask a question on [the AWS DynamoDB forum](https://forums.aws.amazon.com/forum.jspa?forumID=131&start=0)
 * Open a support ticket with [AWS Support](https://console.aws.amazon.com/support/home#/)


## Changes

#### 1.2.9
* Fixed “NeedMoreData: not enough data” error in case of server sending exception-response

#### 1.2.8
* Fixed “NeedMoreData: not enough data” error
  ([#4038](https://github.com/aws/aws-sdk-js/issues/4038))
* Fixed erroneous validation error on duplicate attribute name values in ExpressionAttributeNames

#### 1.2.7
* AuthenticationRequiredException is a retryable request
* Improved request routing, connection management and retry logic

#### 1.2.6
* Add support for TLS and encrypted DAX clusters

#### 1.2.5
* Lock antlr4 to 4.8.x to avoid breaking application running older node version when upgrading to 4.9.0
* Replace use of deprecated Buffer constructors

#### 1.2.4
* Minor bug fixes.

#### 1.2.3
* Retry prefer to choose a different node.
* Adjust exponential back off delay and strategy.

#### 1.2.2
* Fix unrecoverable request timeout after DAX node restart.
* Fix connection timeout during DAX server restart.
* Allow retry for IO exceptions.
* Remove verbose connection error logs.
* Fix empty string encoding bug.

#### 1.2.1
* Bug fix in TransactionGetItems Api to return Key element correctly.

#### 1.2.0
* Support for DynamoDB Transaction Apis.
* Fix excessive background endpoint refresh calls.

#### 1.1.4
* Fix connection leaks on timeout.
* Support configurable requestTimeout. (Default: 60s)

#### 1.1.3
* Fix transient error on tube cleanup
* Fix UpdateItem result parsing with a subset of attributes changed
* Increase default connectTimeout and make it configurable

#### 1.1.2
* Fix socket leaks on validation errors
* Fix SocketTimeout caused by connection establishment
* Fix issue with update response if the item is not changed
* Fix error decoding BatchWrite UnprocessedItems.

#### 1.1.1
* Fix socket leaks on errors

#### 1.1.0
* Brand new decoder for improved performance on large results
* Improved connection/timer management to allow clean exit on Lambda

#### 1.0.2
* Improved connection/timer management to allow clean exit on Lambda

#### 1.0.1
* Initial release
