import { Stack, StackProps } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

export class HardwareStorageManagementStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const helloFunction = new NodejsFunction(this, 'HelloFunction', {
      entry: 'lambdas/hello.ts',
    });
    const welcomeFunction = new NodejsFunction(this, 'WelcomeFunction', {
      entry: 'lambdas/welcome.ts',
    });
    const getAllTodosFunction = this.createNodeJsFunction(
      'GetAllTodosFunction',
      'lambdas/todos.get.ts'
    );
  }

  createNodeJsFunction(
    functionName: string,
    entry: string,
    runtime: Runtime = Runtime.NODEJS_20_X
  ): NodejsFunction {
    return new NodejsFunction(this, functionName, {
      runtime: runtime,
      entry,
    });
  }
}
