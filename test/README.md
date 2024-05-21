mkdir ./node_modules/amazon-dax-client/
mkdir ./node_modules/amazon-dax-client/src/
mkdir ./node_modules/amazon-dax-client/generated-src/
cp ../src/* ./node_modules/amazon-dax-client/src/
cp ../generated-src/* ./node_modules/amazon-dax-client/generated-src/
cp ../package.json ./node_modules/amazon-dax-client/

tar -a -cf deployment.zip *

operation not allowed add kms to DaxtoDDB role

VPC endpoint https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/vpc-endpoints-dynamodb.html