import { Stack, StackProps } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { NodejsFunction } from './lambda';

export class HardwareStorageManagementStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const helloFunction = NodejsFunction(
      this,
      'HelloFunction',
      'lambdas/hello.ts'
    );
    const welcomeFunction = NodejsFunction(
      this,
      'WelcomeFunction',
      'lambdas/welcome.ts'
    );
    const getAllTodosFunction = NodejsFunction(
      this,
      'GetAllTodosFunction',
      'lambdas/todos.get.ts'
    );
  }
}
