import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';

export interface UserLoginServiceStackProps extends cdk.StackProps {
  environment: string;
  envSuffix: string;
}

export class UserLoginServiceStack extends cdk.Stack {
  public readonly apiErrorAlarm: cloudwatch.Alarm;
  constructor(scope: Construct, id: string, props: UserLoginServiceStackProps) {
    super(scope, id, props);

    const usersTable = new dynamodb.Table(this, 'UsersTable', {
      tableName: `speak-greek-now-users${props.envSuffix}`,
      partitionKey: {
        name: 'userId',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    cdk.Tags.of(usersTable).add('Project', 'SpeakHellenic');
    cdk.Tags.of(usersTable).add('Environment', props.environment);
    cdk.Tags.of(usersTable).add('Component', 'UserAuthentication');

    const accessLogGroup = new logs.LogGroup(this, 'UserApiAccessLogs', {
      logGroupName: `/aws/apigateway/speak-greek-now-user-api${props.envSuffix}`,
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const api = new apigateway.RestApi(this, 'UserApi', {
      restApiName: `Speak Greek Now User API${props.envSuffix}`,
      description: `User management API for Speak Greek Now authentication - ${props.environment} environment`,
      deployOptions: {
        stageName: 'prod',
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: false,
        metricsEnabled: true,
        accessLogDestination: new apigateway.LogGroupLogDestination(accessLogGroup),
        accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields({
          caller: false,
          httpMethod: true,
          ip: true,
          protocol: true,
          requestTime: true,
          resourcePath: true,
          responseLength: true,
          status: true,
          user: false,
        }),
      },
      defaultCorsPreflightOptions: {
        allowOrigins:
          props.environment === 'prod'
            ? ['https://speakhellenic.com', 'https://www.speakhellenic.com']
            : ['http://localhost:3000', 'https://development.d3v5vb4u9puz3w.amplifyapp.com'],
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'x-api-key',
          'X-Amz-Security-Token',
        ],
        allowCredentials: true,
      },
    });

    cdk.Tags.of(api).add('Project', 'SpeakHellenic');
    cdk.Tags.of(api).add('Environment', props.environment);
    cdk.Tags.of(api).add('Component', 'UserAuthentication');

    const apiKey = api.addApiKey('UserApiKey', {
      apiKeyName: `speak-greek-now-user-api-key${props.envSuffix}`,
      description: `API key for frontend authentication - ${props.environment} environment`,
    });

    const usagePlan = api.addUsagePlan('UserApiUsagePlan', {
      name: `MVP Usage Plan${props.envSuffix}`,
      description: `Usage plan optimized for MVP scale (200 req/min target) - ${props.environment} environment`,
      throttle: {
        rateLimit: 10,
        burstLimit: 20,
      },
      quota: {
        limit: 5000,
        period: apigateway.Period.MONTH,
      },
    });

    usagePlan.addApiKey(apiKey);
    usagePlan.addApiStage({
      stage: api.deploymentStage,
    });

    const lambdaEnvironment = {
      TABLE_NAME: usersTable.tableName,
      LOG_LEVEL: props.environment === 'prod' ? 'INFO' : 'DEBUG',
    };

    const lambdaBundling = {
      minify: true,
      sourceMap: false,
      externalModules: ['@aws-sdk/*'],
      forceDockerBundling: false,
    };

    const createUserFunction = new lambdaNodejs.NodejsFunction(this, 'CreateUserFunction', {
      functionName: `speak-greek-now-create-user${props.envSuffix}`,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: path.join(__dirname, 'lambda', 'handlers', 'create-user-handler.ts'),
      environment: lambdaEnvironment,
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
      description: `Creates new users - ${props.environment} environment`,
      bundling: lambdaBundling,
    });

    usersTable.grantReadWriteData(createUserFunction);

    const getUserFunction = new lambdaNodejs.NodejsFunction(this, 'GetUserFunction', {
      functionName: `speak-greek-now-get-user${props.envSuffix}`,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: path.join(__dirname, 'lambda', 'handlers', 'get-user-handler.ts'),
      environment: lambdaEnvironment,
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
      description: `Retrieves users by ID - ${props.environment} environment`,
      bundling: lambdaBundling,
    });

    usersTable.grantReadData(getUserFunction);

    const updateUserFunction = new lambdaNodejs.NodejsFunction(this, 'UpdateUserFunction', {
      functionName: `speak-greek-now-update-user${props.envSuffix}`,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: path.join(__dirname, 'lambda', 'handlers', 'update-user-handler.ts'),
      environment: lambdaEnvironment,
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
      description: `Updates user data - ${props.environment} environment`,
      bundling: lambdaBundling,
    });

    usersTable.grantReadWriteData(updateUserFunction);

    const deleteUserFunction = new lambdaNodejs.NodejsFunction(this, 'DeleteUserFunction', {
      functionName: `speak-greek-now-delete-user${props.envSuffix}`,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: path.join(__dirname, 'lambda', 'handlers', 'delete-user-handler.ts'),
      environment: lambdaEnvironment,
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
      description: `Deletes users - ${props.environment} environment`,
      bundling: lambdaBundling,
    });

    usersTable.grantReadWriteData(deleteUserFunction);

    const usersResource = api.root.addResource('users');
    const userResource = usersResource.addResource('{userId}');

    const createUserIntegration = new apigateway.LambdaIntegration(createUserFunction, {
      proxy: true,
    });

    usersResource.addMethod('POST', createUserIntegration, {
      apiKeyRequired: true,
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
          },
        },
        {
          statusCode: '400',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
          },
        },
        {
          statusCode: '500',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
          },
        },
      ],
    });

    const getUserIntegration = new apigateway.LambdaIntegration(getUserFunction, {
      proxy: true,
    });

    userResource.addMethod('GET', getUserIntegration, {
      apiKeyRequired: true,
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
          },
        },
        {
          statusCode: '404',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
          },
        },
      ],
    });

    const updateUserIntegration = new apigateway.LambdaIntegration(updateUserFunction, {
      proxy: true,
    });

    userResource.addMethod('PUT', updateUserIntegration, {
      apiKeyRequired: true,
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
          },
        },
        {
          statusCode: '400',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
          },
        },
        {
          statusCode: '404',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
          },
        },
        {
          statusCode: '500',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
          },
        },
      ],
    });

    const deleteUserIntegration = new apigateway.LambdaIntegration(deleteUserFunction, {
      proxy: true,
    });

    userResource.addMethod('DELETE', deleteUserIntegration, {
      apiKeyRequired: true,
      methodResponses: [
        {
          statusCode: '204',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
          },
        },
        {
          statusCode: '404',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
          },
        },
        {
          statusCode: '500',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
          },
        },
      ],
    });

    this.apiErrorAlarm = new cloudwatch.Alarm(this, 'UserApiErrorAlarm', {
      alarmName: `SpeakHellenic-UserApi-HighErrorRate${props.envSuffix}`,
      alarmDescription: `Alert when User API has high error rate (4xx/5xx) - ${props.environment} environment`,
      metric: new cloudwatch.MathExpression({
        expression: 'clientErrors + serverErrors',
        usingMetrics: {
          clientErrors: api.metricClientError({
            statistic: 'Sum',
            period: cdk.Duration.minutes(5),
          }),
          serverErrors: api.metricServerError({
            statistic: 'Sum',
            period: cdk.Duration.minutes(5),
          }),
        },
        period: cdk.Duration.minutes(5),
      }),
      threshold: 10,
      evaluationPeriods: 2,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    new cdk.CfnOutput(this, 'UserApiUrl', {
      value: api.url,
      description: 'User API Gateway URL (provide to frontend team)',
      exportName: `UserApiUrl${props.envSuffix}`,
    });

    new cdk.CfnOutput(this, 'UserApiKeyId', {
      value: apiKey.keyId,
      description:
        'User API Key ID - Get value: aws apigateway get-api-key --api-key <KEY_ID> --include-value --query value --output text',
      exportName: `UserApiKeyId${props.envSuffix}`,
    });

    new cdk.CfnOutput(this, 'UsersTableName', {
      value: usersTable.tableName,
      description: 'DynamoDB users table name',
      exportName: `UsersTableName${props.envSuffix}`,
    });

    new cdk.CfnOutput(this, 'UsersTableArn', {
      value: usersTable.tableArn,
      description: 'DynamoDB users table ARN',
      exportName: `UsersTableArn${props.envSuffix}`,
    });

    new cdk.CfnOutput(this, 'AccessLogGroupName', {
      value: accessLogGroup.logGroupName,
      description: 'CloudWatch Log Group for API access logs',
      exportName: `UserApiAccessLogGroup${props.envSuffix}`,
    });
  }
}
