import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';

export interface UserLoginServiceStackProps extends cdk.StackProps {
  environment: string;
  envSuffix: string;
}

export class UserLoginServiceStack extends cdk.Stack {
  public readonly apiErrorAlarm: cloudwatch.Alarm;
  constructor(scope: Construct, id: string, props: UserLoginServiceStackProps) {
    super(scope, id, props);

    // DynamoDB Table for user data
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

    // Add resource tags for cost tracking
    cdk.Tags.of(usersTable).add('Project', 'SpeakHellenic');
    cdk.Tags.of(usersTable).add('Environment', props.environment);
    cdk.Tags.of(usersTable).add('Component', 'UserAuthentication');

    // CloudWatch Log Group for API access logs (7-day retention for MVP)
    const accessLogGroup = new logs.LogGroup(this, 'UserApiAccessLogs', {
      logGroupName: `/aws/apigateway/speak-greek-now-user-api${props.envSuffix}`,
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // API Gateway REST API
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
          props.environment === 'production'
            ? ['https://speakhellenic.com', 'https://www.speakhellenic.com']
            : ['http://localhost:3000', 'https://development.d3v5vb4u9puz3w.amplifyapp.com'],
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
    cdk.Tags.of(api).add('Environment', props.environment);
    cdk.Tags.of(api).add('Component', 'UserAuthentication');

    // API Key for authentication
    const apiKey = api.addApiKey('UserApiKey', {
      apiKeyName: `speak-greek-now-user-api-key${props.envSuffix}`,
      description: `API key for frontend authentication - ${props.environment} environment`,
    });

    // Usage Plan with MVP-appropriate throttling (200 req/min target)
    const usagePlan = api.addUsagePlan('UserApiUsagePlan', {
      name: `MVP Usage Plan${props.envSuffix}`,
      description: `Usage plan optimized for MVP scale (200 req/min target) - ${props.environment} environment`,
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
  "lastLoginAt": "$item.lastLoginAt.S"#if($item.completedLessons),
  "completedLessons": [
    #foreach($lesson in $item.completedLessons.L)
    {
      "id": "$lesson.M.id.S",
      "at": "$lesson.M.at.S"
    }#if($foreach.hasNext),#end
    #end
  ]#end
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

    // PUT /users/{userId} - Update user (lastLoginAt and completedLessons)
    const updateUserIntegration = new apigateway.AwsIntegration({
      service: 'dynamodb',
      action: 'UpdateItem',
      options: {
        credentialsRole: apiRole,
        requestTemplates: {
          'application/json': `#set($inputRoot = $input.path('$'))
#set($lastLogin = $inputRoot.lastLoginAt)
#set($completedLessons = $inputRoot.completedLessons)

## Build update expression and attribute values dynamically
#set($updates = [])
#set($attrValues = "{")
#set($hasValues = false)

## lastLoginAt
#if($lastLogin && $lastLogin != "")
  #set($void = $updates.add("lastLoginAt = :lastLoginAt"))
  #if($hasValues)#set($attrValues = "$attrValues,")#end
  #set($attrValues = "$attrValues"":lastLoginAt"": {""S"": ""$lastLogin""}")
  #set($hasValues = true)
#end

## completedLessons (supports empty array)
#if($completedLessons)
  #set($void = $updates.add("completedLessons = :completedLessons"))
  #if($hasValues)#set($attrValues = "$attrValues,")#end
  #set($attrValues = "$attrValues"":completedLessons"": {""L"": [")
  #set($first = true)
  #foreach($lesson in $completedLessons)
    #if(!$first)#set($attrValues = "$attrValues,")#end
    #set($attrValues = "$attrValues{""M"": {""id"": {""S"": ""$lesson.id""}, ""at"": {""S"": ""$lesson.at""}}}")
    #set($first = false)
  #end
  #set($attrValues = "$attrValues]}")
  #set($hasValues = true)
#end

#set($attrValues = "$attrValues}")

## Build final update expression
#set($updateExpr = "SET ")
#foreach($update in $updates)
$update#if($foreach.hasNext), #end
#end

{
  "TableName": "${usersTable.tableName}",
  "Key": {
    "userId": { "S": "$util.urlDecode($input.params('userId'))" }
  },
  "UpdateExpression": "$updateExpr",
  "ConditionExpression": "attribute_exists(userId)",
  "ExpressionAttributeValues": $attrValues,
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
  "lastLoginAt": "$attrs.lastLoginAt.S"#if($attrs.completedLessons),
  "completedLessons": [
    #foreach($lesson in $attrs.completedLessons.L)
    {
      "id": "$lesson.M.id.S",
      "at": "$lesson.M.at.S"
    }#if($foreach.hasNext),#end
    #end
  ]#end
}`,
            },
            responseParameters: {
              'method.response.header.Access-Control-Allow-Origin': "'*'",
            },
          },
          {
            statusCode: '400',
            selectionPattern: '.*ValidationError.*',
            responseTemplates: {
              'application/json':
                '{ "error": "ValidationError", "message": "Invalid request: check completedLessons structure or ensure at least one field is provided" }',
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

    // CloudWatch Alarm for API errors (4xx and 5xx)
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

    // CloudFormation Outputs
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
