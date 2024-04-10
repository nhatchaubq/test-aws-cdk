import { App, CfnParameter, Stack, StackProps } from 'aws-cdk-lib';
import { Alias, Function, Runtime, Version } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { Lambda, NodejsFunction } from '../lib/lambda';
import {
  CfnStage,
  HttpApi,
  HttpMethod,
  MappingValue,
  ParameterMapping,
} from 'aws-cdk-lib/aws-apigatewayv2';
import {
  Effect,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from 'aws-cdk-lib/aws-iam';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';

export class HardwareStorageManagementStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // const stage = new CfnParameter(this, 'stage', {
    //   type: 'String',
    //   default: 'dev',
    //   description:
    //     'Development stages of the app (eg. `dev`, `stg`, or `prod`)',
    // }).valueAsString;
    // const rollback =
    //   new CfnParameter(this, 'rollback', {
    //     type: 'String',
    //     default: 'false',
    //     description:
    //       'Development stages of the app (eg. `dev`, `stg`, or `prod`)',
    //   }).valueAsString === 'true';
    const stage = (scope as App).node.tryGetContext('stage') ?? 'dev';
    const rollback =
      (scope as App).node.tryGetContext('rollback') === 'true' ?? false;

    // const lambdaExecutionRole = new Role(this, 'BasicLambdaExecutionRole', {
    //   roleName: 'BasicLambdaExecutionRole',
    //   assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
    // });
    // lambdaExecutionRole.addToPrincipalPolicy(
    //   new PolicyStatement({
    //     effect: Effect.ALLOW,
    //     actions: [
    //       'logs:CreateLogGroup',
    //       'logs:CreateLogStream',
    //       'logs:PutLogEvents',
    //     ],
    //     resources: ['arn:lambda:${Region}:${Account}:function:*'],
    //   })
    // );

    const [helloFunction] = NodejsFunction(this, 'HelloFunction', {
      entry: 'lambdas/hello.ts',
      // role: lambdaExecutionRole,
    });
    const helloFunctionAlias = new Alias(this, `HelloFunctionAlias_${stage}`, {
      aliasName: stage,
      version: helloFunction.currentVersion,
    });

    const [welcomeFunction] = NodejsFunction(this, 'WelcomeFunction', {
      entry: 'lambdas/welcome.ts',
      // role: lambdaExecutionRole,
    });
    const welcomeFunctionAlias = new Alias(
      this,
      `WelcomeFunctionAlias_${stage}`,
      {
        aliasName: stage,
        version: welcomeFunction.currentVersion,
      }
    );

    const [getAllTodosFunction] = NodejsFunction(this, 'GetAllTodosFunction', {
      entry: 'lambdas/todos.get.ts',
      // role: lambdaExecutionRole,
    });
    const getAllTodosFunctionAlias = new Alias(
      this,
      `GetAllTodosFunctionAlias_${stage}`,
      {
        aliasName: stage,
        version: getAllTodosFunction.currentVersion,
      }
    );

    Lambda.create().with

    const httpApi = new HttpApi(this, 'api-gateway', {
      apiName: 'ApiGateway',
      description: 'Http API Gateway for Hardward Storage Management Project.',
    });
    new CfnStage(this, `ApiGatewatStage_dev`, {
      apiId: httpApi.apiId,
      stageName: 'dev',
      autoDeploy: true,
      stageVariables: {
        lambdaAlias: 'dev',
      },
    });
    new CfnStage(this, `ApiGatewatStage_stg`, {
      apiId: httpApi.apiId,
      stageName: 'stg',
      autoDeploy: true,
      stageVariables: {
        lambdaAlias: 'stg',
      },
    });
    new CfnStage(this, `ApiGatewatStage_prod`, {
      apiId: httpApi.apiId,
      stageName: 'prod',
      autoDeploy: true,
      stageVariables: {
        lambdaAlias: 'prod',
      },
    });
    if (!['dev', 'stg', 'prod'].includes(stage)) {
      new CfnStage(this, `ApiGatewatStage_${stage}`, {
        apiId: httpApi.apiId,
        stageName: stage,
        autoDeploy: true,
        stageVariables: {
          lambdaAlias: stage,
        },
      });
    }
    httpApi.addRoutes({
      path: '/hello',
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration(
        `ApiGatewayHelloFunctionIntegration`,
        helloFunctionAlias,
        {
          parameterMapping: new ParameterMapping().overwriteHeader(
            'content-type',
            MappingValue.custom('application/json')
          ),
        }
      ),
    });
    httpApi.addRoutes({
      path: '/welcome',
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration(
        `ApiGatewayWelcomeFunctionIntegration`,
        Function.fromFunctionArn(this, 'ApiGatewayWelcomeFunctionArn', `${welcomeFunction.functionArn}:\${stageVariables.lambdaAlias}`),
        {
          parameterMapping: new ParameterMapping().overwriteHeader(
            'content-type',
            MappingValue.custom('application/json')
          ),
        }
      ),
    });
    httpApi.addRoutes({
      path: '/todos',
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration(
        `ApiGatewayGetAllTodosFunctionIntegration`,
        getAllTodosFunctionAlias,
        {
          parameterMapping: new ParameterMapping().overwriteHeader(
            'content-type',
            MappingValue.custom('application/json')
          ),
        }
      ),
    });
  }
}
