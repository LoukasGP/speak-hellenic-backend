#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { S3StorageStack } from '../lib/s3-bucket-storage';
import { UserLoginServiceStack } from '../lib/user-login-service';

const app = new cdk.App();

// Get environment from context (defaults to 'prod' to maintain existing production stack)
const environment = app.node.tryGetContext('environment') || 'prod';
const isProduction = environment === 'prod';

// Environment-specific configuration
const envConfig = {
  dev: {
    stackSuffix: '-Dev', // Dev gets a suffix to create new stacks
    apiUsagePlanName: 'Development Usage Plan',
    apiUsagePlanDescription: 'Usage plan for development environment',
    apiThrottleRate: 10, // 10 req/sec
    apiThrottleBurst: 20,
    apiQuotaLimit: 10000, // 10k requests/month for dev
    logRetentionDays: 2,
  },
  prod: {
    stackSuffix: '', // Prod has no suffix (uses existing production stacks)
    apiUsagePlanName: 'Production Usage Plan',
    apiUsagePlanDescription: 'Usage plan for production environment',
    apiThrottleRate: 10, // 10 req/sec (same as dev for MVP)
    apiThrottleBurst: 20,
    apiQuotaLimit: 50000, // 50k requests/month for production
    logRetentionDays: 14,
  },
};

const config = envConfig[environment as keyof typeof envConfig];

if (!config) {
  throw new Error(
    `Invalid environment: ${environment}. Must be 'dev' or 'prod'. Use: cdk deploy -c environment=dev`,
  );
}

// S3 Storage Stack for MP3 lesson files
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

// User Login Service Stack for authentication
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
