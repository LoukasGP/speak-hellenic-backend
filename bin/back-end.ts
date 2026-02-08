#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { S3StorageStack } from '../lib/s3-bucket-storage';
import { UserLoginServiceStack } from '../lib/user-login-service';

const app = new cdk.App();
const environment = app.node.tryGetContext('environment') || 'prod';

const envConfig = {
  dev: {
    stackSuffix: '-dev',
    apiUsagePlanName: 'Development Usage Plan',
    apiUsagePlanDescription: 'Usage plan for development environment',
    apiThrottleRate: 2,
    apiThrottleBurst: 2,
    apiQuotaLimit: 10000,
    logRetentionDays: 2,
  },
  prod: {
    stackSuffix: '',
    apiUsagePlanName: 'Production Usage Plan',
    apiUsagePlanDescription: 'Usage plan for production environment',
    apiThrottleRate: 10,
    apiThrottleBurst: 20,
    apiQuotaLimit: 50000,
    logRetentionDays: 14,
  },
};

const config = envConfig[environment as keyof typeof envConfig];

if (!config) {
  throw new Error(
    `Invalid environment: ${environment}. Must be 'dev' or 'prod'. Use: cdk deploy -c environment=dev`
  );
}

if (!process.env.CDK_DEFAULT_ACCOUNT || !process.env.CDK_DEFAULT_REGION) {
  throw new Error('CDK_DEFAULT_ACCOUNT and CDK_DEFAULT_REGION must be set');
}

new S3StorageStack(app, `SpeakHellenic-S3StorageStack${config.stackSuffix}`, {
  environment,
  envSuffix: config.stackSuffix,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  description: `S3 Storage Stack for ${environment} environment - Speak Hellenic MP3 files`,
  tags: {
    Environment: environment,
    Project: 'SpeakHellenic',
    ManagedBy: 'CDK',
  },
});

new UserLoginServiceStack(app, `SpeakHellenic-UserLoginServiceStack${config.stackSuffix}`, {
  environment,
  envSuffix: config.stackSuffix,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  description: `User Login Service Stack for ${environment} environment - Authentication and user management`,
  tags: {
    Environment: environment,
    Project: 'SpeakHellenic',
    ManagedBy: 'CDK',
  },
});
