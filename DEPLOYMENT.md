# Deployment Guide

## Multi-Environment Setup

This project supports separate **dev** and **prod** environments with isolated stacks.

### Environment Configuration

| Environment | Stack Suffix | DynamoDB Table | API Quota | Log Retention |
|-------------|--------------|----------------|-----------|---------------|
| **Dev**     | `-Dev`       | `speak-greek-now-users` (dev) | 10k/month | 7 days |
| **Prod**    | `-Prod`      | `speak-greek-now-users` (prod) | 50k/month | 30 days |

### Stack Names

**Development:**
- `SpeakHellenic-S3StorageStack-Dev`
- `SpeakHellenic-UserLoginServiceStack-Dev`

**Production:**
- `SpeakHellenic-S3StorageStack-Prod`
- `SpeakHellenic-UserLoginServiceStack-Prod`

## Deployment Commands

### Development Environment

```bash
# Synthesize CloudFormation templates
npm run synth:dev

# View what will change before deploying
npm run diff:dev

# Deploy all stacks to dev
npm run deploy:dev

# Destroy all dev stacks
npm run destroy:dev
```

### Production Environment

```bash
# Synthesize CloudFormation templates
npm run synth:prod

# View what will change before deploying
npm run diff:prod

# Deploy all stacks to prod
npm run deploy:prod

# Destroy all prod stacks
npm run destroy:prod
```

## First-Time Deployment

### Prerequisites

1. AWS CLI configured with credentials
2. AWS CDK bootstrapped in your account/region:
   ```bash
   cdk bootstrap aws://ACCOUNT-NUMBER/REGION
   ```

### Deploy Development Environment

```bash
# Build TypeScript
npm run build

# Synthesize to verify templates
npm run synth:dev

# Review changes
npm run diff:dev

# Deploy
npm run deploy:dev
```

After deployment, you'll see outputs with:
- API Gateway URL
- API Key ID (retrieve with `aws apigateway get-api-key --api-key <id> --include-value`)
- DynamoDB table names
- CloudWatch log group names

### Deploy Production Environment

```bash
# Build TypeScript
npm run build

# Synthesize to verify templates
npm run synth:prod

# Review changes
npm run diff:prod

# Deploy (requires confirmation for production)
npm run deploy:prod
```

## Environment Variables

Update your frontend `.env` files with the deployed API endpoints:

**`.env.development`:**
```env
NEXT_PUBLIC_USER_API_URL=https://xxxxx.execute-api.us-east-1.amazonaws.com/prod/
USER_API_KEY=<dev-api-key-from-aws>
```

**`.env.production`:**
```env
NEXT_PUBLIC_USER_API_URL=https://yyyyy.execute-api.us-east-1.amazonaws.com/prod/
USER_API_KEY=<prod-api-key-from-aws>
```

## Retrieving API Key

After deployment, get the API key:

```bash
# Get the API key ID from CDK output, then:
aws apigateway get-api-key --api-key <KEY-ID-FROM-OUTPUT> --include-value --query 'value' --output text
```

## Common Tasks

### Update Only User Login Service (Dev)

```bash
cdk deploy SpeakHellenic-UserLoginServiceStack-Dev -c environment=dev
```

### View CloudWatch Logs

```bash
# Dev logs
aws logs tail /aws/apigateway/speak-greek-now-user-api --follow

# Filter for errors
aws logs tail /aws/apigateway/speak-greek-now-user-api --follow --filter-pattern "ERROR"
```

### Check DynamoDB Table

```bash
# List items in dev table
aws dynamodb scan --table-name speak-greek-now-users

# Get specific user
aws dynamodb get-item \
  --table-name speak-greek-now-users \
  --key '{"userId":{"S":"auth0|123456"}}'
```

## Troubleshooting

### "Stack already exists"

If you have existing stacks without environment suffix:
1. Either destroy old stacks: `cdk destroy <old-stack-name>`
2. Or rename them in AWS CloudFormation console

### "No stacks match"

Ensure you're passing the environment context:
```bash
# ✅ Correct
npm run deploy:dev

# ❌ Wrong
cdk deploy  # Missing environment context
```

### Resource Limits

If deployment fails due to limits:
- Check AWS service quotas in your account
- Verify you're not hitting DynamoDB table limits
- Check API Gateway throttling limits

## Monitoring

### CloudWatch Alarms

Both environments have error rate alarms configured:
- **Dev:** `SpeakHellenic-UserApi-HighErrorRate` (10 errors in 10 minutes)
- **Prod:** `SpeakHellenic-UserApi-HighErrorRate` (10 errors in 10 minutes)

### Metrics to Watch

- API Gateway 4xx/5xx errors
- DynamoDB read/write capacity
- API Gateway request count
- Lambda errors (if added later)

## Cost Optimization

### Development
- Log retention: 7 days (vs 30 for prod)
- Quota: 10k requests/month
- Can be destroyed when not in use: `npm run destroy:dev`

### Production
- Point-in-time recovery enabled on DynamoDB
- 30-day log retention
- Higher quota: 50k requests/month
- RETAIN policy on critical resources

## Security Best Practices

1. **Never commit API keys** to git
2. **Use different AWS accounts** for dev/prod (optional but recommended)
3. **Enable MFA** on AWS accounts
4. **Rotate API keys** periodically
5. **Review CloudWatch logs** for suspicious activity
6. **Use AWS Secrets Manager** for sensitive values (future enhancement)

## Next Steps

After deploying to dev:
1. Test all API endpoints
2. Verify DynamoDB writes
3. Check CloudWatch logs
4. Test frontend integration
5. Once stable, deploy to prod
