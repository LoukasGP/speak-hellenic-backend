import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';

export class BackEndStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'SpeakGreekNowBucket', {
      bucketName: `speak-greek-now-bucket-${this.account}`,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.HEAD],
          allowedOrigins: [
            'http://localhost:3000',
            'https://speakhellenic.com',
            'https://www.speakhellenic.com',
            'https://development.d3v5vb4u9puz3w.amplifyapp.com',
          ],
          allowedHeaders: ['Authorization', 'Content-Type', 'x-amz-date', 'x-amz-user-agent'],
          maxAge: 3000,
        },
      ],
      publicReadAccess: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
    });

    new cdk.CfnOutput(this, 'BucketName', {
      value: bucket.bucketName,
      description: 'Name of the S3 bucket',
    });

    new cdk.CfnOutput(this, 'BucketArn', {
      value: bucket.bucketArn,
      description: 'ARN of the S3 bucket',
    });

    new cdk.CfnOutput(this, 'BucketUrl', {
      value: `https://${bucket.bucketName}.s3.${this.region}.amazonaws.com`,
      description: 'Direct S3 URL for public access',
    });

    new cdk.CfnOutput(this, 'BucketRegion', {
      value: this.region,
      description: 'AWS region of the S3 bucket',
    });

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

    const api = new apigateway.RestApi(this, 'UserApi', {
      restApiName: 'Speak Greek Now User API',
      description: 'User management API for Speak Greek Now authentication',
      deployOptions: {
        stageName: 'prod',
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
        metricsEnabled: true,
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
          'X-Api-Key',
          'x-api-key',
          'X-Amz-Security-Token',
        ],
        allowCredentials: true,
      },
    });

    const apiKey = api.addApiKey('UserApiKey', {
      apiKeyName: 'speak-greek-now-user-api-key',
      description: 'API key for frontend authentication',
    });

    const usagePlan = api.addUsagePlan('UserApiUsagePlan', {
      name: 'Standard Usage Plan',
      description: 'Usage plan for user API access',
      throttle: {
        rateLimit: 100,
        burstLimit: 200,
      },
      quota: {
        limit: 10000,
        period: apigateway.Period.MONTH,
      },
    });

    usagePlan.addApiKey(apiKey);
    usagePlan.addApiStage({
      stage: api.deploymentStage,
    });

    const apiRole = new iam.Role(this, 'ApiGatewayDynamoDBRole', {
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
      description: 'Allows API Gateway to perform operations on DynamoDB users table',
    });

    usersTable.grantReadWriteData(apiRole);

    const usersResource = api.root.addResource('users');
    const userResource = usersResource.addResource('{userId}');

    const createUserIntegration = new apigateway.AwsIntegration({
      service: 'dynamodb',
      action: 'PutItem',
      options: {
        credentialsRole: apiRole,
        requestTemplates: {
          'application/json': `{
  "TableName": "${usersTable.tableName}",
  "Item": {
    "userId": { "S": "$input.path('$.userId')" },
    "email": { "S": "$input.path('$.email')" },
    "name": { "S": "$input.path('$.name')" },
    "picture": { "S": "$input.path('$.picture')" },
    "createdAt": { "S": "$input.path('$.createdAt')" },
    "lastLoginAt": { "S": "$input.path('$.lastLoginAt')" }
  }
}`,
        },
        integrationResponses: [
          {
            statusCode: '200',
            responseTemplates: {
              'application/json': `#set($inputRoot = $input.path('$'))
{
  "userId": "$input.path('$.userId')",
  "email": "$input.path('$.email')",
  "name": "$input.path('$.name')",
  "picture": "$input.path('$.picture')",
  "createdAt": "$input.path('$.createdAt')",
  "lastLoginAt": "$input.path('$.lastLoginAt')"
}`,
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
      ],
    });

    const getUserIntegration = new apigateway.AwsIntegration({
      service: 'dynamodb',
      action: 'GetItem',
      options: {
        credentialsRole: apiRole,
        requestTemplates: {
          'application/json': `{
  "TableName": "${usersTable.tableName}",
  "Key": {
    "userId": { "S": "$input.params('userId')" }
  }
}`,
        },
        integrationResponses: [
          {
            statusCode: '200',
            responseTemplates: {
              'application/json': `#set($item = $input.path('$.Item'))
#if($item.userId)
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
{ "message": "User not found" }
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

    const updateUserIntegration = new apigateway.AwsIntegration({
      service: 'dynamodb',
      action: 'UpdateItem',
      options: {
        credentialsRole: apiRole,
        requestTemplates: {
          'application/json': `{
  "TableName": "${usersTable.tableName}",
  "Key": {
    "userId": { "S": "$input.params('userId')" }
  },
  "UpdateExpression": "SET lastLoginAt = :lastLoginAt",
  "ExpressionAttributeValues": {
    ":lastLoginAt": { "S": "$input.path('$.lastLoginAt')" }
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
      ],
    });

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
  }
}
