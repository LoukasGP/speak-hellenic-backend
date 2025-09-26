import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';

export class BackEndStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    const bucket = new s3.Bucket(this, 'SpeakGreekNowBucket', {
      bucketName: `speak-greek-now-bucket-${this.account}`,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.HEAD,
          ],
          allowedOrigins: ['http://localhost:3000', 'https://speakhellenic.com/', 'https://www.speakhellenic.com/'],
          allowedHeaders: ['Authorization', 'Content-Type', 'x-amz-date', 'x-amz-user-agent'],
          maxAge: 3000,
        },
      ],
      publicReadAccess: true, // Enable public read access
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS, // Only block ACLs, allow bucket policies
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

  }
}
