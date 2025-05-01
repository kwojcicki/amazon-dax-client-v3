You probably don't need/want to be looking at this :) notes to myself for developing this middleware dumpster fire

mkdir ./node_modules/amazon-dax-client-sdkv3/
mkdir ./node_modules/amazon-dax-client-sdkv3/src/
mkdir ./node_modules/amazon-dax-client-sdkv3/generated-src/
cp ../src/* ./node_modules/amazon-dax-client-sdkv3/src/
cp ../generated-src/* ./node_modules/amazon-dax-client-sdkv3/generated-src/
cp ../package.json ./node_modules/amazon-dax-client-sdkv3/

npm run build

operation not allowed add kms to DaxtoDDB role

VPC endpoint https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/vpc-endpoints-dynamodb.html
VPC STS https://docs.aws.amazon.com/lambda/latest/dg/troubleshooting-networking.html
https://docs.aws.amazon.com/vpc/latest/privatelink/create-interface-endpoint.html