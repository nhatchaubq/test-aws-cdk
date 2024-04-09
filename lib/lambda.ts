import { Duration } from 'aws-cdk-lib';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import {
  NodejsFunctionProps as aws_NodejsFunctionProps,
  NodejsFunction as aws_NodejsFunction,
} from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

type NodejsFunctionDefaultProps = Omit<
  aws_NodejsFunctionProps,
  'architecture' | 'functionName' | 'runtime'
>;

export function NodejsFunction(
  scope: Construct,
  name: string,
  options: NodejsFunctionDefaultProps
): aws_NodejsFunction {
  return new aws_NodejsFunction(scope, name, {
    ...{
      architecture: Architecture.ARM_64,
      functionName: name,
      runtime: Runtime.NODEJS_LATEST,
      memorySize: 512,
      timeout: Duration.seconds(10),
      logRetention: RetentionDays.ONE_WEEK,
    },
    ...options,
  });
}
