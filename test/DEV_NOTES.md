You probably don't need/want to be looking at this :) notes to myself for developing this middleware dumpster fire

mkdir ./node_modules/amazon-dax-client-sdkv3/
mkdir ./node_modules/amazon-dax-client-sdkv3/src/
mkdir ./node_modules/amazon-dax-client-sdkv3/generated-src/
cp ../src/* ./node_modules/amazon-dax-client-sdkv3/src/
cp ../generated-src/* ./node_modules/amazon-dax-client-sdkv3/generated-src/
cp ../package.json ./node_modules/amazon-dax-client-sdkv3/

tar -a -cf deployment.zip *

operation not allowed add kms to DaxtoDDB role

VPC endpoint https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/vpc-endpoints-dynamodb.html