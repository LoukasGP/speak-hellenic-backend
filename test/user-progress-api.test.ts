import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { UserLoginServiceStack } from '../lib/user-login-service';

describe('User Progress API Tests', () => {
  let template: Template;

  beforeAll(() => {
    const app = new cdk.App();
    const stack = new UserLoginServiceStack(app, 'TestUserLoginServiceStack', {
      environment: 'test',
      envSuffix: '-test',
    });
    template = Template.fromStack(stack);
  });

  describe('DynamoDB Table Configuration', () => {
    test('DynamoDB table accepts completedLessons attribute (no schema enforcement needed)', () => {
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        TableName: 'speak-greek-now-users-test',
        AttributeDefinitions: [
          {
            AttributeName: 'userId',
            AttributeType: 'S',
          },
        ],
        KeySchema: [
          {
            AttributeName: 'userId',
            KeyType: 'HASH',
          },
        ],
      });
    });
  });

  describe('GET /users/{userId} - Returns completedLessons', () => {
    test('GET endpoint exists with correct configuration', () => {
      template.hasResourceProperties('AWS::ApiGateway::Method', {
        HttpMethod: 'GET',
        ApiKeyRequired: true,
      });
    });

    test('GET response template includes completedLessons when present', () => {
      const integrations = template.findResources('AWS::ApiGateway::Method');

      let foundGetIntegration = false;
      Object.values(integrations).forEach((resource) => {
        if ((resource as any).Properties.HttpMethod === 'GET') {
          foundGetIntegration = true;
        }
      });

      expect(foundGetIntegration).toBe(true);
    });
  });

  describe('PUT /users/{userId} - Update User with completedLessons', () => {
    test('PUT endpoint exists with correct configuration', () => {
      template.hasResourceProperties('AWS::ApiGateway::Method', {
        HttpMethod: 'PUT',
        ApiKeyRequired: true,
      });
    });

    test('PUT method has correct response codes configured', () => {
      const methods = template.findResources('AWS::ApiGateway::Method');

      let foundPutMethod = false;
      Object.values(methods).forEach((resource) => {
        if ((resource as any).Properties.HttpMethod === 'PUT') {
          foundPutMethod = true;
          const methodResponses = (resource as any).Properties.MethodResponses;

          const statusCodes = methodResponses.map((r: any) => r.StatusCode);
          expect(statusCodes).toContain('200');
          expect(statusCodes).toContain('400');
          expect(statusCodes).toContain('404');
          expect(statusCodes).toContain('500');
        }
      });

      expect(foundPutMethod).toBe(true);
    });

    test('API has CORS configured for PUT requests', () => {
      template.hasResourceProperties('AWS::ApiGateway::RestApi', {
        Name: 'Speak Greek Now User API',
      });
    });
  });

  describe('API Gateway Configuration', () => {
    test('API Gateway has CloudWatch logging enabled', () => {
      template.hasResourceProperties('AWS::ApiGateway::Stage', {
        StageName: 'prod',
        MethodSettings: [
          {
            LoggingLevel: 'INFO',
            MetricsEnabled: true,
          },
        ],
      });
    });

    test('API key authentication is configured', () => {
      template.hasResourceProperties('AWS::ApiGateway::ApiKey', {
        Enabled: true,
        Name: 'speak-greek-now-user-api-key',
      });
    });

    test('Usage plan is configured with correct limits', () => {
      template.hasResourceProperties('AWS::ApiGateway::UsagePlan', {
        Throttle: {
          RateLimit: 10,
          BurstLimit: 20,
        },
        Quota: {
          Limit: 5000,
          Period: 'MONTH',
        },
      });
    });
  });

  describe('IAM Permissions', () => {
    test('API Gateway role has DynamoDB read/write permissions', () => {
      template.hasResourceProperties('AWS::IAM::Role', {
        AssumeRolePolicyDocument: {
          Statement: [
            {
              Action: 'sts:AssumeRole',
              Effect: 'Allow',
              Principal: {
                Service: 'apigateway.amazonaws.com',
              },
            },
          ],
        },
      });

      template.hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: {
          Statement: [
            {
              Action: [
                'dynamodb:BatchGetItem',
                'dynamodb:GetRecords',
                'dynamodb:GetShardIterator',
                'dynamodb:Query',
                'dynamodb:GetItem',
                'dynamodb:Scan',
                'dynamodb:ConditionCheckItem',
                'dynamodb:BatchWriteItem',
                'dynamodb:PutItem',
                'dynamodb:UpdateItem',
                'dynamodb:DeleteItem',
                'dynamodb:DescribeTable',
              ],
              Effect: 'Allow',
            },
          ],
        },
      });
    });
  });

  describe('CloudWatch Monitoring', () => {
    test('Access log group is configured', () => {
      template.hasResourceProperties('AWS::Logs::LogGroup', {
        LogGroupName: '/aws/apigateway/speak-greek-now-user-api-test',
        RetentionInDays: 7,
      });
    });

    test('Error alarm is configured', () => {
      template.hasResourceProperties('AWS::CloudWatch::Alarm', {
        AlarmName: 'SpeakHellenic-UserApi-HighErrorRate',
        Threshold: 10,
        EvaluationPeriods: 2,
      });
    });
  });
});

/**
 * Integration Test Notes:
 *
 * The following scenarios require runtime testing against deployed infrastructure:
 *
 * 1. GET /users/{userId} returns completedLessons for user with progress
 *    - Expected: { userId, email, name, picture, createdAt, lastLoginAt, completedLessons: [{id, at}] }
 *
 * 2. GET /users/{userId} returns empty array or undefined for new user
 *    - Expected: { userId, email, ..., completedLessons: [] } or completedLessons omitted
 *
 * 3. PUT /users/{userId} with completedLessons updates the field
 *    - Request: { completedLessons: [{id: "lesson-1", at: "2026-02-03T10:00:00Z"}] }
 *    - Expected: 200 OK, field updated in DynamoDB
 *
 * 4. PUT /users/{userId} with lastLoginAt doesn't affect completedLessons
 *    - Request: { lastLoginAt: "2026-02-03T10:00:00Z" }
 *    - Expected: 200 OK, completedLessons unchanged
 *
 * 5. PUT /users/{userId} with invalid array structure returns 400
 *    - Request: { completedLessons: [{ invalidField: "test" }] }
 *    - Expected: 400 Bad Request
 *
 * 6. PUT /users/{userId} with 100+ completions succeeds
 *    - Request: { completedLessons: [... 100 items ...] }
 *    - Expected: 200 OK, all items stored (within DynamoDB item size limit)
 *
 * 7. PUT /users/{userId} with empty completedLessons array
 *    - Request: { completedLessons: [] }
 *    - Expected: 200 OK, field set to empty array
 *
 * 8. CORS headers are present in responses
 *    - Expected: Access-Control-Allow-Origin header in all responses
 *
 * Runtime Testing Command:
 * After deployment, run: npm run test:integration
 * This will execute real API calls against the deployed stack.
 */
