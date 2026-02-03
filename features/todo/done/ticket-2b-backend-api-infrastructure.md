# Ticket 2B: User API Infrastructure - Backend CDK Implementation

**Parent:** [Master Requirements](./README.md)  
**Status:** 🔴 Not Started  
**Estimated Time:** 2-3 hours  
**Dependencies:** None (can be done independently)  
**Target Repository:** Infrastructure/CDK Repository (separate from frontend)

---

## 📋 Objective

Deploy the **backend API infrastructure** using AWS CDK. This provides the HTTP API that the frontend (Ticket 2A) will consume for user operations.

**This ticket focuses ONLY on the backend AWS infrastructure.**

---

## 🎯 What This Ticket Delivers

1. **DynamoDB Table** for user storage
2. **API Gateway REST API** with three endpoints
3. **VTL (Velocity Template Language)** request/response mappings
4. **API Key** authentication
5. **CORS configuration** for frontend domain
6. **CloudWatch logging** for monitoring

---

## 🏗️ Architecture

```
Frontend (Next.js)
       ↓ HTTPS
       ↓ (x-api-key header)
       ↓
API Gateway REST API
       ↓
VTL Request Mapping
       ↓
DynamoDB Table
       ↓
VTL Response Mapping
       ↓
Frontend receives JSON
```

**Benefits:**

- ✅ No Lambda (no cold starts)
- ✅ Direct DynamoDB integration
- ✅ Low latency
- ✅ Cost-effective (pay per request)

---

## 📦 Prerequisites

### AWS Environment

- [ ] AWS Account with appropriate permissions
- [ ] AWS CDK installed (`npm install -g aws-cdk`)
- [ ] CDK bootstrapped in target region (`cdk bootstrap`)
- [ ] AWS CLI configured with credentials

### CDK Project Setup

If starting from scratch:

```bash
mkdir speak-greek-now-api
cd speak-greek-now-api
cdk init app --language=typescript
npm install @aws-cdk/aws-apigateway @aws-cdk/aws-dynamodb
```

---

## 🗄️ DynamoDB Table Specification

**Table Name:** `speak-greek-now-users`

**Schema:**

| Attribute     | Type   | Key Type      | Description                    |
| ------------- | ------ | ------------- | ------------------------------ |
| `userId`      | String | Partition Key | Google OAuth user ID (unique)  |
| `email`       | String | Attribute     | User's email address           |
| `name`        | String | Attribute     | User's display name (optional) |
| `picture`     | String | Attribute     | Profile picture URL (optional) |
| `createdAt`   | String | Attribute     | ISO timestamp of creation      |
| `lastLoginAt` | String | Attribute     | ISO timestamp of last login    |

**Billing Mode:** PAY_PER_REQUEST (no capacity planning needed)

**Encryption:** AWS-managed encryption at rest

**Point-in-Time Recovery:** Enabled (recommended)

---

## 🔌 API Gateway Endpoints

### Base URL

```
https://{api-id}.execute-api.{region}.amazonaws.com/prod
```

### Endpoint 1: Create User

**Method:** `POST /users`

**Request Body:**

```json
{
  "userId": "google-oauth2|123456789",
  "email": "user@example.com",
  "name": "John Doe",
  "picture": "https://example.com/photo.jpg",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "lastLoginAt": "2024-01-15T10:30:00.000Z"
}
```

**Response:** `200 OK`

```json
{
  "userId": "google-oauth2|123456789",
  "email": "user@example.com",
  "name": "John Doe",
  "picture": "https://example.com/photo.jpg",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "lastLoginAt": "2024-01-15T10:30:00.000Z"
}
```

**DynamoDB Operation:** `PutItem`

---

### Endpoint 2: Get User by ID

**Method:** `GET /users/{userId}`

**Path Parameter:** `userId` (Google OAuth ID)

**Response:** `200 OK` or `404 Not Found`

```json
{
  "userId": "google-oauth2|123456789",
  "email": "user@example.com",
  "name": "John Doe",
  "picture": "https://example.com/photo.jpg",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "lastLoginAt": "2024-01-15T10:30:00.000Z"
}
```

**DynamoDB Operation:** `GetItem`

---

### Endpoint 3: Update Last Login

**Method:** `PUT /users/{userId}`

**Path Parameter:** `userId` (Google OAuth ID)

**Request Body:**

```json
{
  "lastLoginAt": "2024-01-15T11:00:00.000Z"
}
```

**Response:** `200 OK`

```json
{
  "userId": "google-oauth2|123456789",
  "email": "user@example.com",
  "name": "John Doe",
  "picture": "https://example.com/photo.jpg",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "lastLoginAt": "2024-01-15T11:00:00.000Z"
}
```

**DynamoDB Operation:** `UpdateItem`

---

## 🔨 CDK Implementation

### Stack Structure

**File:** `lib/user-api-stack.ts`

```typescript
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class UserApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // =============================================
    // DynamoDB Table
    // =============================================
    const usersTable = new dynamodb.Table(this, 'UsersTable', {
      tableName: 'speak-greek-now-users',
      partitionKey: {
        name: 'userId',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN, // Don't delete on stack deletion
    });

    // =============================================
    // API Gateway
    // =============================================
    const api = new apigateway.RestApi(this, 'UserApi', {
      restApiName: 'Speak Greek Now User API',
      description: 'User management API for Speak Greek Now authentication',
      deployOptions: {
        stageName: 'prod',
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: false, // Disable full request/response logging in production to avoid exposing API keys and PII
      },
      defaultCorsPreflightOptions: {
        allowOrigins: [
          'https://your-frontend-domain.com',
          'http://localhost:3000', // For local development
        ],
        allowMethods: ['GET', 'POST', 'PUT', 'OPTIONS'],
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
        ],
        allowCredentials: true,
      },
    });

    // =============================================
    // API Key for Authentication
    // =============================================
    const apiKey = api.addApiKey('UserApiKey', {
      apiKeyName: 'speak-greek-now-user-api-key',
      description: 'API key for frontend authentication',
    });

    const usagePlan = api.addUsagePlan('UserApiUsagePlan', {
      name: 'Standard Usage Plan',
      throttle: {
        rateLimit: 100, // requests per second
        burstLimit: 200,
      },
      quota: {
        limit: 10000, // requests per month
        period: apigateway.Period.MONTH,
      },
    });

    usagePlan.addApiKey(apiKey);
    usagePlan.addApiStage({
      stage: api.deploymentStage,
    });

    // =============================================
    // IAM Role for API Gateway → DynamoDB
    // =============================================
    const apiRole = new iam.Role(this, 'ApiGatewayDynamoDBRole', {
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
    });

    usersTable.grantReadWriteData(apiRole);

    // =============================================
    // API Resources and Methods
    // =============================================
    const usersResource = api.root.addResource('users');
    const userResource = usersResource.addResource('{userId}');

    // =============================================
    // POST /users - Create User
    // =============================================
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
              'application/json': `{
  "userId": "$input.path('$.Item.userId.S')",
  "email": "$input.path('$.Item.email.S')",
  "name": "$input.path('$.Item.name.S')",
  "picture": "$input.path('$.Item.picture.S')",
  "createdAt": "$input.path('$.Item.createdAt.S')",
  "lastLoginAt": "$input.path('$.Item.lastLoginAt.S')"
}`,
            },
          },
        ],
      },
    });

    usersResource.addMethod('POST', createUserIntegration, {
      apiKeyRequired: true,
      methodResponses: [{ statusCode: '200' }],
    });

    // =============================================
    // GET /users/{userId} - Get User
    // =============================================
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
          },
        ],
      },
    });

    userResource.addMethod('GET', getUserIntegration, {
      apiKeyRequired: true,
      methodResponses: [{ statusCode: '200' }, { statusCode: '404' }],
    });

    // =============================================
    // PUT /users/{userId} - Update Last Login
    // =============================================
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
          },
        ],
      },
    });

    userResource.addMethod('PUT', updateUserIntegration, {
      apiKeyRequired: true,
      methodResponses: [{ statusCode: '200' }],
    });

    // =============================================
    // Stack Outputs
    // =============================================
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL (provide to frontend team)',
      exportName: 'UserApiUrl',
    });

    new cdk.CfnOutput(this, 'ApiKeyId', {
      value: apiKey.keyId,
      description: 'API Key ID (retrieve value from AWS Console)',
      exportName: 'UserApiKeyId',
    });

    new cdk.CfnOutput(this, 'TableName', {
      value: usersTable.tableName,
      description: 'DynamoDB table name',
      exportName: 'UsersTableName',
    });
  }
}
```

---

## 🚀 Deployment Steps

### Step 1: Install Dependencies

```bash
npm install @aws-cdk/aws-apigateway @aws-cdk/aws-dynamodb @aws-cdk/aws-iam
```

### Step 2: Update Frontend CORS Origins

**In the CDK code above, replace:**

```typescript
allowOrigins: [
  'https://your-frontend-domain.com', // ← Update this
  'http://localhost:3000',
],
```

**With your actual frontend domain:**

```typescript
allowOrigins: [
  'https://main.d1234567890.amplifyapp.com', // Production
  'http://localhost:3000', // Local development
],
```

### Step 3: Synthesize CloudFormation

```bash
cdk synth
```

**Expected Output:** CloudFormation template generated successfully

### Step 4: Deploy to AWS

```bash
cdk deploy
```

**Expected Output:**

```
Stack UserApiStack
Outputs:
UserApiStack.ApiUrl = https://abc123xyz.execute-api.eu-west-1.amazonaws.com/prod/
UserApiStack.ApiKeyId = abc123keyid
UserApiStack.TableName = speak-greek-now-users
```

**Save these outputs - you'll need them for Ticket 2A!**

### Step 5: Retrieve API Key Value

The API Key ID is output, but you need the actual key value:

```bash
aws apigateway get-api-key --api-key abc123keyid --include-value --query 'value' --output text
```

**Save this API key securely - provide it to the frontend team for Ticket 2A.**

---

## ✅ Acceptance Criteria

### Infrastructure Deployed

- [ ] DynamoDB table `speak-greek-now-users` created
- [ ] API Gateway REST API deployed
- [ ] Three endpoints functional (POST, GET, PUT)
- [ ] API Key created and retrieved
- [ ] CORS configured with frontend domain

### VTL Templates

- [ ] POST /users uses PutItem with correct mapping
- [ ] GET /users/{userId} uses GetItem with correct mapping
- [ ] PUT /users/{userId} uses UpdateItem with correct mapping
- [ ] 404 responses handled in VTL for missing users
- [ ] Response templates return proper JSON structure

### Security

- [ ] API Key authentication required on all endpoints
- [ ] IAM role grants minimum required DynamoDB permissions
- [ ] CORS allows only specified origins
- [ ] CloudWatch logging enabled
- [ ] No hardcoded credentials

### Outputs

- [ ] API Gateway URL output and documented
- [ ] API Key retrieved and securely stored
- [ ] Table name output and verified

---

## 🧪 Testing & Verification

### Test 1: Create User (POST)

```bash
curl -X POST https://YOUR_API_URL/users \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "email": "test@example.com",
    "name": "Test User",
    "picture": "https://example.com/photo.jpg",
    "createdAt": "2024-01-15T10:00:00Z",
    "lastLoginAt": "2024-01-15T10:00:00Z"
  }'
```

**Expected Response:** `200 OK` with user object

### Test 2: Get User (GET)

```bash
curl -X GET https://YOUR_API_URL/users/test-user-123 \
  -H "x-api-key: YOUR_API_KEY"
```

**Expected Response:** `200 OK` with user object

### Test 3: Update Last Login (PUT)

```bash
curl -X PUT https://YOUR_API_URL/users/test-user-123 \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "lastLoginAt": "2024-01-15T11:00:00Z"
  }'
```

**Expected Response:** `200 OK` with updated user object

### Test 4: 404 Handling

```bash
curl -X GET https://YOUR_API_URL/users/non-existent-user \
  -H "x-api-key: YOUR_API_KEY"
```

**Expected Response:** `404 Not Found`

### Test 5: CORS Preflight

```bash
curl -X OPTIONS https://YOUR_API_URL/users \
  -H "Origin: https://your-frontend-domain.com" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

**Expected Response:** CORS headers present

### Test 6: Verify in AWS Console

- [ ] Open DynamoDB console
- [ ] Find table `speak-greek-now-users`
- [ ] Verify test user record exists
- [ ] Check all attributes are populated correctly

---

## 📦 Deliverables to Frontend Team

After successful deployment, provide to Ticket 2A implementer:

### 1. API Gateway URL

```
https://abc123xyz.execute-api.eu-west-1.amazonaws.com/prod
```

**Usage:** Set as `NEXT_PUBLIC_USER_API_URL` in frontend `.env.local`

### 2. API Key

```
AbCd1234EfGh5678IjKl9012MnOp3456QrSt7890
```

**Usage:** Set as `USER_API_KEY` in frontend `.env.local`

### 3. API Documentation

Provide this table:

| Endpoint          | Method | Purpose           | Request Body                                       |
| ----------------- | ------ | ----------------- | -------------------------------------------------- |
| `/users`          | POST   | Create user       | `{ userId, email, name, picture, createdAt, ... }` |
| `/users/{userId}` | GET    | Get user by ID    | None                                               |
| `/users/{userId}` | PUT    | Update last login | `{ lastLoginAt }`                                  |

### 4. Authentication Header

```
x-api-key: YOUR_API_KEY
```

---

## 📝 Notes

### VTL (Velocity Template Language)

VTL is used for request/response mapping without Lambda:

**Benefits:**

- No Lambda cold starts
- Lower latency
- Cost-effective
- Simple mappings

**Limitations:**

- Limited to simple transformations
- No complex business logic
- Learning curve for VTL syntax

### Cost Estimation

For authentication use case (estimate):

- **DynamoDB:** PAY_PER_REQUEST
  - 1M reads = $0.25
  - 1M writes = $1.25
- **API Gateway:** REST API
  - 1M requests = $3.50
- **Data Transfer:** Minimal

**Estimated monthly cost for 10K users:** < $5

### Monitoring

CloudWatch Logs automatically created:

- **API Gateway Logs:** Request/response details
- **DynamoDB Metrics:** Read/write capacity, throttling
- **API Key Usage:** Track usage per key

**Set up alarms for:**

- High error rate (> 5%)
- Slow response time (> 1s)
- Throttling events

---

## 🔗 Dependencies

### Enables These Tickets

- **Ticket 2A:** Frontend API Service (needs API URL and key)
- **Ticket 3:** Google OAuth Routes (needs user storage backend)

---

## 🆘 Troubleshooting

### "Cannot find module @aws-cdk/..."

**Solution:**

```bash
npm install @aws-cdk/aws-apigateway @aws-cdk/aws-dynamodb @aws-cdk/aws-iam
```

### CDK deployment fails with permission errors

**Solution:**

Ensure your AWS credentials have permissions for:

- DynamoDB (CreateTable, DeleteTable)
- API Gateway (CreateRestApi, CreateDeployment)
- IAM (CreateRole, AttachRolePolicy)
- CloudFormation (CreateStack, UpdateStack)

### CORS errors in browser

**Solution:**

1. Verify frontend domain in `allowOrigins`
2. Redeploy CDK stack: `cdk deploy`
3. Clear browser cache
4. Check API Gateway CORS settings in AWS Console

### VTL template errors

**Solution:**

1. Check CloudWatch logs for API Gateway
2. Verify JSON syntax in VTL templates
3. Test in API Gateway console (Test feature)

### API Key not working

**Solution:**

1. Verify API Key is associated with usage plan
2. Check usage plan is associated with deployment stage
3. Retrieve API Key value (not just ID)

---

## ✅ Definition of Done

- [ ] CDK stack deployed successfully
- [ ] DynamoDB table created and verified
- [ ] API Gateway deployed with all three endpoints
- [ ] VTL templates tested and working
- [ ] API Key created and retrieved
- [ ] CORS configured correctly
- [ ] All curl tests passing
- [ ] CloudWatch logs enabled and visible
- [ ] API URL and API Key documented
- [ ] Frontend team notified with credentials
- [ ] Infrastructure documented in repository

---

**Handoff to Frontend Team (Ticket 2A):**

Once this ticket is complete, provide:

1. ✅ API Gateway URL
2. ✅ API Key value
3. ✅ API documentation (endpoints, request/response formats)
4. ✅ CORS domains configured

Frontend team can then complete Ticket 2A with this information.

---

_Last Updated: 2025-01-03_
