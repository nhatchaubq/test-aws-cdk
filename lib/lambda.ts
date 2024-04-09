import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction as aws_NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

export function NodejsFunction(
  scope: Construct,
  name: string,
  entry: string,
  runtime: Runtime = Runtime.NODEJS_20_X
): aws_NodejsFunction {
  return new aws_NodejsFunction(scope, name, {
    runtime,
    entry,
  });
}
