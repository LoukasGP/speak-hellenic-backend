import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';

export interface S3StorageStackProps extends cdk.StackProps {
  environment: string;
  envSuffix: string;
}

export class S3StorageStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: S3StorageStackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'SpeakHellenicBucket', {
      bucketName: `speak-greek-now-lessons${props.envSuffix}-${this.account}`,
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

    // Add resource tags for cost tracking
    cdk.Tags.of(bucket).add('Project', 'SpeakHellenic');
    cdk.Tags.of(bucket).add('Environment', props.environment);
    cdk.Tags.of(bucket).add('Component', 'LessonStorage');

    new cdk.CfnOutput(this, 'BucketName', {
      value: bucket.bucketName,
      description: 'Name of the S3 bucket for MP3 lesson files',
      exportName: 'LessonBucketName',
    });

    new cdk.CfnOutput(this, 'BucketArn', {
      value: bucket.bucketArn,
      description: 'ARN of the S3 bucket',
      exportName: 'LessonBucketArn',
    });

    new cdk.CfnOutput(this, 'BucketUrl', {
      value: `https://${bucket.bucketName}.s3.${this.region}.amazonaws.com`,
      description: 'Direct S3 URL for public access to lesson files',
      exportName: 'LessonBucketUrl',
    });

    new cdk.CfnOutput(this, 'BucketRegion', {
      value: this.region,
      description: 'AWS region of the S3 bucket',
      exportName: 'LessonBucketRegion',
    });
  }
}
