import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import type { HttpApi } from 'aws-cdk-lib/aws-apigatewayv2';
import { Source } from 'aws-cdk-lib/aws-codebuild';
import {
  Alias,
  Architecture,
  Runtime,
  Tracing,
  Version,
} from 'aws-cdk-lib/aws-lambda';
import {
  type NodejsFunctionProps,
  NodejsFunction,
  SourceMapMode,
} from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

type NodejsFunctionDefaultProps = Omit<
  NodejsFunctionProps,
  'architecture' | 'functionName' | 'runtime'
> & {
  stage?: string;
  deploymentVersion?: string;
};

const defaultNodeJsFunctionProps = (functionName: string) => {
  return {
    architecture: Architecture.ARM_64,
    functionName,
    runtime: Runtime.NODEJS_LATEST,
    memorySize: 512,
    timeout: Duration.seconds(10),
    logRetention: RetentionDays.ONE_WEEK,
  } as const;
};

export function NodejsFunctionA(
  scope: Construct,
  functionName: string,
  options: NodejsFunctionDefaultProps
): [NodejsFunction, Alias, Alias, Alias?] {
  const { stage, deploymentVersion } = options;
  const lambdaFunction = new NodejsFunction(scope, functionName, {
    ...defaultNodeJsFunctionProps(functionName),
    ...options,
  });
  const stgVersion = new Version(scope, `${name}Version_stg`, {
    lambda: lambdaFunction,
  });
  const stgAlias = new Alias(scope, `${name}Alias_stg`, {
    aliasName: 'stg',
    version: stgVersion,
  });
  const prodAlias = new Alias(scope, `${name}Alias_prod`, {
    aliasName: 'prod',
    version: stgVersion,
  });
  // if (stage === 'stg') {
  // }
  // if (stage === 'prod') {
  //   let version;
  //   const stgAlias = new Alias(scope, `${name}Alias_prod`, {
  //     aliasName: 'prod',
  //     version: devAlias.ve,
  //   });
  // }

  return [lambdaFunction, stgAlias, prodAlias];
}

/**
 * ILambdaProps provices all properties required to create a lambda.
 * @extends { NodejsFunctionProps }
 */
export interface ILambdaProps extends NodejsFunctionProps {
  entry: string;
  description: string;
  serviceName: string;
}

/**
 * A set of fixed properties to be applied to a Lambda Function that cannot be overriden.
 * @type { NodejsFunctionProps }
 */
const fixedProps: NodejsFunctionProps = {
  runtime: Runtime.NODEJS_20_X,
  architecture: Architecture.ARM_64,
  awsSdkConnectionReuse: true,
  layers: [],
  tracing: Tracing.PASS_THROUGH,
  currentVersionOptions: {
    removalPolicy: RemovalPolicy.RETAIN,
    description: `Version deployed on ${new Date().toISOString()}`,
  },
  bundling: {
    minify: true,
    sourceMap: true,
    sourceMapMode: SourceMapMode.INLINE,
    sourcesContent: false,
    target: 'node20',
    externalModules: ['aws-sdk'],
  },
};

/**
 * A set of overridable properties to be applied to a Lambda Function.
 * @type { NodejsFunctionProps }
 */
export const defaultProps: NodejsFunctionProps = {
  handler: 'handler',
  timeout: Duration.minutes(1),
};

/**
 * Lamda represents an AWS Lambda Resource.
 * @extends { NodejsFunction }
 */
export class Lambda extends NodejsFunction {
  private static resourceType = 'lambda';
  private api: HttpApi;

  /**
   * A private constructor allowing only the static create function to create an instance of Lambda.
   * @constructor
   * @param {Construct} scope - CDK construct
   * @param {string} id - Resource id
   * @param {NodejsFunctionProps} props - Properties to be applied to the Lambda
   */
  private constructor(
    scope: Construct,
    id: string,
    props: NodejsFunctionProps
  ) {
    super(scope, id, props);
  }

  static with(api: HttpApi): Lambda {
    this.api = api;
  }

  /**
   * Create an instance of Lambda setting fixed and default configuration.
   * @param {Construct} scope - CDK construct
   * @param {string} id - Id of the resource
   * @param {ILambdaProps} props - Properties to be applied when creating the Lambda
   * @returns {Lambda} A new instance of Lambda
   */
  create(scope: Construct, id: string, props: ILambdaProps): Lambda {
    const lambda = new Lambda(scope, id, {
      ...defaultProps,
      ...props,
      ...fixedProps,
      environment: {
        ...(props.environment ?? {}),
        POWERTOOLS_METRICS_NAMESPACE: props.serviceName,
      },
    });
    return new WithApi(lambda);
  }
}
