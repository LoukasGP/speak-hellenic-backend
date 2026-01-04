import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';

export class UserLoginServiceStack extends cdk.Stack {
  public readonly apiErrorAlarm: cloudwatch.Alarm;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Table for user data
    const usersTable = new dynamodb.Table(this, 'UsersTable', {
      tableName: 'speak-greek-now-users',
      partitionKey: {
        name: 'userId',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Add resource tags for cost tracking
    cdk.Tags.of(usersTable).add('Project', 'SpeakHellenic');
    cdk.Tags.of(usersTable).add('Environment', 'Production');
    cdk.Tags.of(usersTable).add('Component', 'UserAuthentication');

    // CloudWatch Log Group for API access logs (7-day retention for MVP)
    const accessLogGroup = new logs.LogGroup(this, 'UserApiAccessLogs', {
      logGroupName: '/aws/apigateway/speak-greek-now-user-api',
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // API Gateway REST API
    const api = new apigateway.RestApi(this, 'UserApi', {
      restApiName: 'Speak Greek Now User API',
      description: 'User management API for Speak Greek Now authentication',
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
        allowOrigins: [
          'http://localhost:3000',
          'https://speakhellenic.com',
          'https://www.speakhellenic.com',
          'https://development.d3v5vb4u9puz3w.amplifyapp.com',
        ],
        allowMethods: ['GET', 'POST', 'PUT', 'OPTIONS'],
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

    // Add resource tags to API Gateway
    cdk.Tags.of(api).add('Project', 'SpeakHellenic');
    cdk.Tags.of(api).add('Environment', 'Production');
    cdk.Tags.of(api).add('Component', 'UserAuthentication');

    // API Key for authentication
    const apiKey = api.addApiKey('UserApiKey', {
      apiKeyName: 'speak-greek-now-user-api-key',
      description: 'API key for frontend authentication',
    });

    // Usage Plan with MVP-appropriate throttling (200 req/min target)
    const usagePlan = api.addUsagePlan('UserApiUsagePlan', {
      name: 'MVP Usage Plan',
      description: 'Usage plan optimized for MVP scale (200 req/min target)',
      throttle: {
        rateLimit: 10, // 10 req/sec = 600 req/min (3x buffer)
        burstLimit: 20, // Allow short bursts
      },
      quota: {
        limit: 5000, // 5000 requests/month for MVP
        period: apigateway.Period.MONTH,
      },
    });

    usagePlan.addApiKey(apiKey);
    usagePlan.addApiStage({
      stage: api.deploymentStage,
    });

    // IAM Role for API Gateway to access DynamoDB
    const apiRole = new iam.Role(this, 'ApiGatewayDynamoDBRole', {
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
      description: 'Allows API Gateway to perform operations on DynamoDB users table',
    });

    usersTable.grantReadWriteData(apiRole);

    // API Resources
    const usersResource = api.root.addResource('users');
    const userResource = usersResource.addResource('{userId}');

    // POST /users - Create new user
    const createUserIntegration = new apigateway.AwsIntegration({
      service: 'dynamodb',
      action: 'PutItem',
      options: {
        credentialsRole: apiRole,
        requestTemplates: {
          'application/json': `#set($userId = $input.path('$.userId'))
#set($email = $input.path('$.email'))
#set($name = $input.path('$.name'))
#set($picture = $input.path('$.picture'))
#set($createdAt = $input.path('$.createdAt'))
#set($lastLoginAt = $input.path('$.lastLoginAt'))
{
  "TableName": "${usersTable.tableName}",
  "Item": {
    "userId": { "S": "$userId" },
    "email": { "S": "$email" },
    "name": { "S": "$name" },
    "picture": { "S": "$picture" },
    "createdAt": { "S": "$createdAt" },
    "lastLoginAt": { "S": "$lastLoginAt" }
  },
  "ConditionExpression": "attribute_not_exists(userId)",
  "ReturnValues": "ALL_NEW"
}`,
        },
        integrationResponses: [
          {
            statusCode: '200',
            responseTemplates: {
              'application/json': `#set($attrs = $input.path('$.Attributes'))
{
  "userId": "$attrs.userId.S",
  "email": "$attrs.email.S",
  "name": "$attrs.name.S",
  "picture": "$attrs.picture.S",
  "createdAt": "$attrs.createdAt.S",
  "lastLoginAt": "$attrs.lastLoginAt.S"
}`,
            },
            responseParameters: {
              'method.response.header.Access-Control-Allow-Origin': "'*'",
            },
          },
          {
            statusCode: '400',
            selectionPattern: '.*/error.*',
            responseTemplates: {
              'application/json':
                '{ "error": "ValidationError", "message": "Missing required fields: userId and email are required" }',
            },
            responseParameters: {
              'method.response.header.Access-Control-Allow-Origin': "'*'",
            },
          },
          {
            statusCode: '400',
            selectionPattern: '.*ConditionalCheckFailedException.*',
            responseTemplates: {
              'application/json':
                '{ "error": "UserAlreadyExists", "message": "A user with this userId already exists" }',
            },
            responseParameters: {
              'method.response.header.Access-Control-Allow-Origin': "'*'",
            },
          },
          {
            statusCode: '500',
            selectionPattern: '.*ServiceUnavailable.*|.*InternalServerError.*',
            responseTemplates: {
              'application/json':
                '{ "error": "ServiceError", "message": "An internal service error occurred" }',
            },
            responseParameters: {
              'method.response.header.Access-Control-Allow-Origin': "'*'",
            },
          },
        ],
      },
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

    // GET /users/{userId} - Get user by ID
    const getUserIntegration = new apigateway.AwsIntegration({
      service: 'dynamodb',
      action: 'GetItem',
      options: {
        credentialsRole: apiRole,
        requestTemplates: {
          'application/json': `{
  "TableName": "${usersTable.tableName}",
  "Key": {
    "userId": { "S": "$util.urlDecode($input.params('userId'))" }
  }
}`,
        },
        integrationResponses: [
          {
            statusCode: '200',
            responseTemplates: {
              'application/json': `#set($item = $input.path('$.Item'))
#if($item && $item.userId)
{
  "userId": "$item.userId.S",
  "email": "$item.email.S",
  "name": "$item.name.S",
  "picture": "$item.picture.S",
  "createdAt": "$item.createdAt.S",
  "lastLoginAt": "$item.lastLoginAt.S"
}
#else
#set($context.responseOverride.status = 404)
{"message": "User not found"}
#end`,
            },
            responseParameters: {
              'method.response.header.Access-Control-Allow-Origin': "'*'",
            },
          },
        ],
      },
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

    // PUT /users/{userId} - Update user last login
    const updateUserIntegration = new apigateway.AwsIntegration({
      service: 'dynamodb',
      action: 'UpdateItem',
      options: {
        credentialsRole: apiRole,
        requestTemplates: {
          'application/json': `#set($lastLogin = $input.path('$.lastLoginAt'))
{
  "TableName": "${usersTable.tableName}",
  "Key": {
    "userId": { "S": "$util.urlDecode($input.params('userId'))" }
  },
  "UpdateExpression": "SET lastLoginAt = :lastLoginAt",
  "ConditionExpression": "attribute_exists(userId)",
  "ExpressionAttributeValues": {
    ":lastLoginAt": { "S": "$lastLogin" }
  },
  "ReturnValues": "ALL_NEW"
}`,
        },
        integrationResponses: [
          {
            statusCode: '200',
            responseTemplates: {
              'application/json': `#set($attrs = $input.path('$.Attributes'))
{
  "userId": "$attrs.userId.S",
  "email": "$attrs.email.S",
  "name": "$attrs.name.S",
  "picture": "$attrs.picture.S",
  "createdAt": "$attrs.createdAt.S",
  "lastLoginAt": "$attrs.lastLoginAt.S"
}`,
            },
            responseParameters: {
              'method.response.header.Access-Control-Allow-Origin': "'*'",
            },
          },
          {
            statusCode: '404',
            selectionPattern: '.*ConditionalCheckFailedException.*',
            responseTemplates: {
              'application/json':
                '{ "error": "ConditionFailed", "message": "The update condition was not met" }',
            },
            responseParameters: {
              'method.response.header.Access-Control-Allow-Origin': "'*'",
            },
          },
          {
            statusCode: '500',
            selectionPattern: '.*ServiceUnavailable.*|.*InternalServerError.*',
            responseTemplates: {
              'application/json':
                '{ "error": "ServiceError", "message": "An internal service error occurred" }',
            },
            responseParameters: {
              'method.response.header.Access-Control-Allow-Origin': "'*'",
            },
          },
        ],
      },
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

    // CloudWatch Alarm for API errors (4xx and 5xx)
    this.apiErrorAlarm = new cloudwatch.Alarm(this, 'UserApiErrorAlarm', {
      alarmName: 'SpeakHellenic-UserApi-HighErrorRate',
      alarmDescription: 'Alert when User API has high error rate (4xx/5xx)',
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

    // CloudFormation Outputs
    new cdk.CfnOutput(this, 'UserApiUrl', {
      value: api.url,
      description: 'User API Gateway URL (provide to frontend team)',
      exportName: 'UserApiUrl',
    });

    new cdk.CfnOutput(this, 'UserApiKeyId', {
      value: apiKey.keyId,
      description:
        'User API Key ID (retrieve value with: aws apigateway get-api-key --api-key <id> --include-value)',
      exportName: 'UserApiKeyId',
    });

    new cdk.CfnOutput(this, 'UsersTableName', {
      value: usersTable.tableName,
      description: 'DynamoDB users table name',
      exportName: 'UsersTableName',
    });

    new cdk.CfnOutput(this, 'UsersTableArn', {
      value: usersTable.tableArn,
      description: 'DynamoDB users table ARN',
      exportName: 'UsersTableArn',
    });

    new cdk.CfnOutput(this, 'AccessLogGroupName', {
      value: accessLogGroup.logGroupName,
      description: 'CloudWatch Log Group for API access logs',
      exportName: 'UserApiAccessLogGroup',
    });
  }
}
