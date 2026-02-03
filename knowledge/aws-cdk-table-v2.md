# [](#class-tablev2-construct)class TableV2 (construct)

Language

Type name

[![](/cdk/api/v2/img/dotnet32.png) .NET](/cdk/api/v2/dotnet/api/Amazon.CDK.AWS.DynamoDB.TableV2.html)

`Amazon.CDK.AWS.DynamoDB.TableV2`

[![](/cdk/api/v2/img/go32.png) Go](https://pkg.go.dev/github.com/aws/aws-cdk-go/awscdk/v2/awsdynamodb#TableV2)

`github.com/aws/aws-cdk-go/awscdk/v2/awsdynamodb#TableV2`

[![](/cdk/api/v2/img/java32.png) Java](/cdk/api/v2/java/software/amazon/awscdk/services/dynamodb/TableV2.html)

`software.amazon.awscdk.services.dynamodb.TableV2`

[![](/cdk/api/v2/img/python32.png) Python](/cdk/api/v2/python/aws_cdk.aws_dynamodb/TableV2.html)

`aws_cdk.aws_dynamodb.TableV2`

![](/cdk/api/v2/img/typescript32.png) TypeScript ([source](https://github.com/aws/aws-cdk/blob/v2.233.0/packages/aws-cdk-lib/aws-dynamodb/lib/table-v2.ts#L512))

`aws-cdk-lib` » `aws_dynamodb` » `TableV2`

_Implements_ [`IConstruct`](constructs.IConstruct.html), [`IDependable`](constructs.IDependable.html), [`IResource`](aws-cdk-lib.IResource.html), [`IEnvironmentAware`](aws-cdk-lib.interfaces.IEnvironmentAware.html), [`ITableV2`](aws-cdk-lib.aws_dynamodb.ITableV2.html), [`ITable`](aws-cdk-lib.aws_dynamodb.ITable.html), [`IResourceWithPolicy`](aws-cdk-lib.aws_iam.IResourceWithPolicy.html), [`IResourceWithPolicyV2`](aws-cdk-lib.aws_iam.IResourceWithPolicyV2.html)

A DynamoDB Table.

## [](#example)Example

    import * as cdk from 'aws-cdk-lib';

    const app = new cdk.App();
    const stack = new cdk.Stack(app, 'Stack', { env: { region: 'us-west-2' } });

    const mrscTable = new dynamodb.TableV2(stack, 'MRSCTable', {
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      multiRegionConsistency: dynamodb.MultiRegionConsistency.STRONG,
      replicas: [
        { region: 'us-east-1' },
      ],
      witnessRegion: 'us-east-2',
    });

## [](#initializer)Initializer

    new TableV2(scope: Construct, id: string, props: TablePropsV2)

_Parameters_

- **scope** [`Construct`](constructs.Construct.html)
- **id** `string`
- **props** [`TablePropsV2`](aws-cdk-lib.aws_dynamodb.TablePropsV2.html)

## [](#construct-props)Construct Props

Name

Type

Description

partitionKey

[`Attribute`](aws-cdk-lib.aws_dynamodb.Attribute.html)

Partition key attribute definition.

billing?

[`Billing`](aws-cdk-lib.aws_dynamodb.Billing.html)

The billing mode and capacity settings to apply to the table.

contributorInsights?⚠️

`boolean`

Whether CloudWatch contributor insights is enabled.

contributorInsightsSpecification?

[`ContributorInsightsSpecification`](aws-cdk-lib.aws_dynamodb.ContributorInsightsSpecification.html)

Whether CloudWatch contributor insights is enabled and what mode is selected.

deletionProtection?

`boolean`

Whether deletion protection is enabled.

dynamoStream?

[`StreamViewType`](aws-cdk-lib.aws_dynamodb.StreamViewType.html)

When an item in the table is modified, StreamViewType determines what information is written to the stream.

encryption?

[`TableEncryptionV2`](aws-cdk-lib.aws_dynamodb.TableEncryptionV2.html)

The server-side encryption.

globalSecondaryIndexes?

[`GlobalSecondaryIndexPropsV2`](aws-cdk-lib.aws_dynamodb.GlobalSecondaryIndexPropsV2.html)`[]`

Global secondary indexes.

kinesisStream?

[`IStream`](aws-cdk-lib.aws_kinesis.IStream.html)

Kinesis Data Stream to capture item level changes.

localSecondaryIndexes?

[`LocalSecondaryIndexProps`](aws-cdk-lib.aws_dynamodb.LocalSecondaryIndexProps.html)`[]`

Local secondary indexes.

multiRegionConsistency?

[`MultiRegionConsistency`](aws-cdk-lib.aws_dynamodb.MultiRegionConsistency.html)

Specifies the consistency mode for a new global table.

pointInTimeRecovery?⚠️

`boolean`

Whether point-in-time recovery is enabled.

pointInTimeRecoverySpecification?

[`PointInTimeRecoverySpecification`](aws-cdk-lib.aws_dynamodb.PointInTimeRecoverySpecification.html)

Whether point-in-time recovery is enabled and recoveryPeriodInDays is set.

removalPolicy?

[`RemovalPolicy`](aws-cdk-lib.RemovalPolicy.html)

The removal policy applied to the table.

replicas?

[`ReplicaTableProps`](aws-cdk-lib.aws_dynamodb.ReplicaTableProps.html)`[]`

Replica tables to deploy with the primary table.

resourcePolicy?

[`PolicyDocument`](aws-cdk-lib.aws_iam.PolicyDocument.html)

Resource policy to assign to DynamoDB Table.

sortKey?

[`Attribute`](aws-cdk-lib.aws_dynamodb.Attribute.html)

Sort key attribute definition.

tableClass?

[`TableClass`](aws-cdk-lib.aws_dynamodb.TableClass.html)

The table class.

tableName?

`string`

The name of the table.

tags?

[`CfnTag`](aws-cdk-lib.CfnTag.html)`[]`

Tags to be applied to the primary table (default replica table).

timeToLiveAttribute?

`string`

The name of the TTL attribute.

warmThroughput?

[`WarmThroughput`](aws-cdk-lib.aws_dynamodb.WarmThroughput.html)

The warm throughput configuration for the table.

witnessRegion?

`string`

The witness Region for the MRSC global table.

---

### [](#partitionkey)partitionKey

_Type:_ [`Attribute`](aws-cdk-lib.aws_dynamodb.Attribute.html)

Partition key attribute definition.

---

### [](#billing)billing?

_Type:_ [`Billing`](aws-cdk-lib.aws_dynamodb.Billing.html) _(optional, default: Billing.onDemand())_

The billing mode and capacity settings to apply to the table.

---

### [](#contributorinsightsspan-classapi-icon-api-icon-deprecated-titlethis-api-element-is-deprecated-its-use-is-not-recommended️span)contributorInsights?⚠️

⚠️ **Deprecated:** use `contributorInsightsSpecification` instead

_Type:_ `boolean` _(optional, default: false)_

Whether CloudWatch contributor insights is enabled.

---

### [](#contributorinsightsspecification)contributorInsightsSpecification?

_Type:_ [`ContributorInsightsSpecification`](aws-cdk-lib.aws_dynamodb.ContributorInsightsSpecification.html) _(optional, default: contributor insights is not enabled)_

Whether CloudWatch contributor insights is enabled and what mode is selected.

---

### [](#deletionprotection)deletionProtection?

_Type:_ `boolean` _(optional, default: false)_

Whether deletion protection is enabled.

---

### [](#dynamostream)dynamoStream?

_Type:_ [`StreamViewType`](aws-cdk-lib.aws_dynamodb.StreamViewType.html) _(optional, default: streams are disabled if replicas are not configured and this property is not specified. If this property is not specified when replicas are configured, then NEW_AND_OLD_IMAGES will be the StreamViewType for all replicas)_

When an item in the table is modified, StreamViewType determines what information is written to the stream.

---

### [](#encryption)encryption?

_Type:_ [`TableEncryptionV2`](aws-cdk-lib.aws_dynamodb.TableEncryptionV2.html) _(optional, default: TableEncryptionV2.dynamoOwnedKey())_

The server-side encryption.

---

### [](#globalsecondaryindexes)globalSecondaryIndexes?

_Type:_ [`GlobalSecondaryIndexPropsV2`](aws-cdk-lib.aws_dynamodb.GlobalSecondaryIndexPropsV2.html)`[]` _(optional, default: no global secondary indexes)_

Global secondary indexes.

Note: You can provide a maximum of 20 global secondary indexes.

---

### [](#kinesisstream)kinesisStream?

_Type:_ [`IStream`](aws-cdk-lib.aws_kinesis.IStream.html) _(optional, default: no Kinesis Data Stream)_

Kinesis Data Stream to capture item level changes.

---

### [](#localsecondaryindexes)localSecondaryIndexes?

_Type:_ [`LocalSecondaryIndexProps`](aws-cdk-lib.aws_dynamodb.LocalSecondaryIndexProps.html)`[]` _(optional, default: no local secondary indexes)_

Local secondary indexes.

Note: You can only provide a maximum of 5 local secondary indexes.

---

### [](#multiregionconsistency)multiRegionConsistency?

_Type:_ [`MultiRegionConsistency`](aws-cdk-lib.aws_dynamodb.MultiRegionConsistency.html) _(optional, default: MultiRegionConsistency.EVENTUAL)_

Specifies the consistency mode for a new global table.

---

### [](#pointintimerecoveryspan-classapi-icon-api-icon-deprecated-titlethis-api-element-is-deprecated-its-use-is-not-recommended️span)pointInTimeRecovery?⚠️

⚠️ **Deprecated:** use `pointInTimeRecoverySpecification` instead

_Type:_ `boolean` _(optional, default: false - point in time recovery is not enabled.)_

Whether point-in-time recovery is enabled.

---

### [](#pointintimerecoveryspecification)pointInTimeRecoverySpecification?

_Type:_ [`PointInTimeRecoverySpecification`](aws-cdk-lib.aws_dynamodb.PointInTimeRecoverySpecification.html) _(optional, default: point in time recovery is not enabled.)_

Whether point-in-time recovery is enabled and recoveryPeriodInDays is set.

---

### [](#removalpolicy)removalPolicy?

_Type:_ [`RemovalPolicy`](aws-cdk-lib.RemovalPolicy.html) _(optional, default: RemovalPolicy.RETAIN)_

The removal policy applied to the table.

---

### [](#replicas)replicas?

_Type:_ [`ReplicaTableProps`](aws-cdk-lib.aws_dynamodb.ReplicaTableProps.html)`[]` _(optional, default: no replica tables)_

Replica tables to deploy with the primary table.

Note: Adding replica tables allows you to use your table as a global table. You cannot specify a replica table in the region that the primary table will be deployed to. Replica tables will only be supported if the stack deployment region is defined.

---

### [](#resourcepolicy)resourcePolicy?

_Type:_ [`PolicyDocument`](aws-cdk-lib.aws_iam.PolicyDocument.html) _(optional, default: No resource policy statements are added to the created table.)_

Resource policy to assign to DynamoDB Table.

See also: [https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-dynamodb-globaltable-replicaspecification.html#cfn-dynamodb-globaltable-replicaspecification-resourcepolicy](/AWSCloudFormation/latest/UserGuide/aws-properties-dynamodb-globaltable-replicaspecification.html#cfn-dynamodb-globaltable-replicaspecification-resourcepolicy)

---

### [](#sortkey)sortKey?

_Type:_ [`Attribute`](aws-cdk-lib.aws_dynamodb.Attribute.html) _(optional, default: no sort key)_

Sort key attribute definition.

---

### [](#tableclass)tableClass?

_Type:_ [`TableClass`](aws-cdk-lib.aws_dynamodb.TableClass.html) _(optional, default: TableClass.STANDARD)_

The table class.

---

### [](#tablename)tableName?

_Type:_ `string` _(optional, default: generated by CloudFormation)_

The name of the table.

---

### [](#tags)tags?

_Type:_ [`CfnTag`](aws-cdk-lib.CfnTag.html)`[]` _(optional, default: no tags)_

Tags to be applied to the primary table (default replica table).

---

### [](#timetoliveattribute)timeToLiveAttribute?

_Type:_ `string` _(optional, default: TTL is disabled)_

The name of the TTL attribute.

---

### [](#warmthroughput)warmThroughput?

_Type:_ [`WarmThroughput`](aws-cdk-lib.aws_dynamodb.WarmThroughput.html) _(optional, default: no warm throughput is configured)_

The warm throughput configuration for the table.

---

### [](#witnessregion)witnessRegion?

_Type:_ `string` _(optional, default: no witness region)_

The witness Region for the MRSC global table.

A MRSC global table can be configured with either three replicas, or with two replicas and one witness.

Note: Witness region cannot be specified for a Multi-Region Eventual Consistency (MREC) Global Table. Witness regions are only supported for Multi-Region Strong Consistency (MRSC) Global Tables.

## [](#properties)Properties

Name

Type

Description

env

[`ResourceEnvironment`](aws-cdk-lib.interfaces.ResourceEnvironment.html)

The environment this resource belongs to.

hasIndex

`boolean`

node

[`Node`](constructs.Node.html)

The tree node.

region

`string`

stack

[`Stack`](aws-cdk-lib.Stack.html)

The stack in which this resource is defined.

tableArn

`string`

The ARN of the table.

tableName

`string`

The name of the table.

tags

[`TagManager`](aws-cdk-lib.TagManager.html)

encryptionKey?

[`IKey`](aws-cdk-lib.aws_kms.IKey.html)

The KMS encryption key for the table.

resourcePolicy?

[`PolicyDocument`](aws-cdk-lib.aws_iam.PolicyDocument.html)

The resource policy for the table.

tableId?

`string`

The ID of the table.

tableStreamArn?

`string`

The stream ARN of the table.

static PROPERTY_INJECTION_ID

`string`

Uniquely identifies this class.

---

### [](#env)env

_Type:_ [`ResourceEnvironment`](aws-cdk-lib.interfaces.ResourceEnvironment.html)

The environment this resource belongs to.

For resources that are created and managed in a Stack (those created by creating new class instances like `new Role()`, `new Bucket()`, etc.), this is always the same as the environment of the stack they belong to.

For referenced resources (those obtained from referencing methods like `Role.fromRoleArn()`, `Bucket.fromBucketName()`, etc.), they might be different than the stack they were imported into.

---

### [](#hasindex)hasIndex

_Type:_ `boolean`

---

### [](#node)node

_Type:_ [`Node`](constructs.Node.html)

The tree node.

---

### [](#region)region

_Type:_ `string`

---

### [](#stack)stack

_Type:_ [`Stack`](aws-cdk-lib.Stack.html)

The stack in which this resource is defined.

---

### [](#tablearn)tableArn

_Type:_ `string`

The ARN of the table.

---

### [](#tablename-1)tableName

_Type:_ `string`

The name of the table.

---

### [](#tags-1)tags

_Type:_ [`TagManager`](aws-cdk-lib.TagManager.html)

---

### [](#encryptionkey)encryptionKey?

_Type:_ [`IKey`](aws-cdk-lib.aws_kms.IKey.html) _(optional)_

The KMS encryption key for the table.

---

### [](#resourcepolicy-1)resourcePolicy?

_Type:_ [`PolicyDocument`](aws-cdk-lib.aws_iam.PolicyDocument.html) _(optional)_

The resource policy for the table.

---

### [](#tableid)tableId?

_Type:_ `string` _(optional)_

The ID of the table.

---

### [](#tablestreamarn)tableStreamArn?

_Type:_ `string` _(optional)_

The stream ARN of the table.

---

### [](#static-property_injection_id)static PROPERTY_INJECTION_ID

_Type:_ `string`

Uniquely identifies this class.

## [](#methods)Methods

Name

Description

addGlobalSecondaryIndex(props)

Add a global secondary index to the table.

addLocalSecondaryIndex(props)

Add a local secondary index to the table.

addReplica(props)

Add a replica table.

addToResourcePolicy(statement)

Adds a statement to the resource policy associated with this table.

applyRemovalPolicy(policy)

Apply the given removal policy to this resource.

grant(grantee, ...actions)

Adds an IAM policy statement associated with this table to an IAM principal's policy.

grantFullAccess(grantee)

Permits an IAM principal to all DynamoDB operations ('dynamodb:\*') on this table.

grantReadData(grantee)

Permits an IAM principal all data read operations on this table.

grantReadWriteData(grantee)

Permits an IAM principal to all data read/write operations on this table.

grantStream(grantee, ...actions)

Adds an IAM policy statement associated with this table to an IAM principal's policy.

grantStreamRead(grantee)

Adds an IAM policy statement associated with this table to an IAM principal's policy.

grantTableListStreams(grantee)

Permits an IAM principal to list streams attached to this table.

grantWriteData(grantee)

Permits an IAM principal all data write operations on this table.

metric(metricName, props?)

Return the given named metric for this table.

metricConditionalCheckFailedRequests(props?)

Metric for the conditional check failed requests for this table.

metricConsumedReadCapacityUnits(props?)

Metric for the consumed read capacity units for this table.

metricConsumedWriteCapacityUnits(props?)

Metric for the consumed write capacity units for this table.

metricSuccessfulRequestLatency(props?)

Metric for the successful request latency for this table.

metricSystemErrors(props?)⚠️

Metric for the system errors this table.

metricSystemErrorsForOperations(props?)

Metric for the system errors for this table. This will sum errors across all possible operations.

metricThrottledRequests(props?)⚠️

How many requests are throttled on this table.

metricThrottledRequestsForOperation(operation, props?)

How many requests are throttled on this table for the given operation.

metricThrottledRequestsForOperations(props?)

How many requests are throttled on this table. This will sum errors across all possible operations.

metricUserErrors(props?)

Metric for the user errors for this table.

replica(region)

Retrieve a replica table.

toString()

Returns a string representation of this construct.

static fromTableArn(scope, id, tableArn)

Creates a Table construct that represents an external table via table ARN.

static fromTableAttributes(scope, id, attrs)

Creates a Table construct that represents an external table.

static fromTableName(scope, id, tableName)

Creates a Table construct that represents an external table via table name.

---

### [](#addwbrglobalwbrsecondarywbrindexprops)addGlobalSecondaryIndex(props)

    public addGlobalSecondaryIndex(props: GlobalSecondaryIndexPropsV2): void

_Parameters_

- **props** [`GlobalSecondaryIndexPropsV2`](aws-cdk-lib.aws_dynamodb.GlobalSecondaryIndexPropsV2.html) — the properties of the global secondary index.

Add a global secondary index to the table.

Note: Global secondary indexes will be inherited by all replica tables.

---

### [](#addwbrlocalwbrsecondarywbrindexprops)addLocalSecondaryIndex(props)

    public addLocalSecondaryIndex(props: LocalSecondaryIndexProps): void

_Parameters_

- **props** [`LocalSecondaryIndexProps`](aws-cdk-lib.aws_dynamodb.LocalSecondaryIndexProps.html) — the properties of the local secondary index.

Add a local secondary index to the table.

Note: Local secondary indexes will be inherited by all replica tables.

---

### [](#addwbrreplicaprops)addReplica(props)

    public addReplica(props: ReplicaTableProps): void

_Parameters_

- **props** [`ReplicaTableProps`](aws-cdk-lib.aws_dynamodb.ReplicaTableProps.html) — the properties of the replica table to add.

Add a replica table.

Note: Adding a replica table will allow you to use your table as a global table.

---

### [](#addwbrtowbrresourcewbrpolicystatement)addToResourcePolicy(statement)

    public addToResourcePolicy(statement: PolicyStatement): AddToResourcePolicyResult

_Parameters_

- **statement** [`PolicyStatement`](aws-cdk-lib.aws_iam.PolicyStatement.html) — The policy statement to add.

_Returns_

- [`AddToResourcePolicyResult`](aws-cdk-lib.aws_iam.AddToResourcePolicyResult.html)

Adds a statement to the resource policy associated with this table.

A resource policy will be automatically created upon the first call to `addToResourcePolicy`.

Note that this does not work with imported tables.

---

### [](#applywbrremovalwbrpolicypolicy)applyRemovalPolicy(policy)

    public applyRemovalPolicy(policy: RemovalPolicy): void

_Parameters_

- **policy** [`RemovalPolicy`](aws-cdk-lib.RemovalPolicy.html)

Apply the given removal policy to this resource.

The Removal Policy controls what happens to this resource when it stops being managed by CloudFormation, either because you've removed it from the CDK application or because you've made a change that requires the resource to be replaced.

The resource can be deleted (`RemovalPolicy.DESTROY`), or left in your AWS account for data recovery and cleanup later (`RemovalPolicy.RETAIN`).

---

### [](#grantgrantee-actions)grant(grantee, ...actions)

    public grant(grantee: IGrantable, ...actions: string[]): Grant

_Parameters_

- **grantee** [`IGrantable`](aws-cdk-lib.aws_iam.IGrantable.html) — the principal (no-op if undefined).
- **actions** `string` — the set of actions to allow (i.e., 'dynamodb:PutItem', 'dynamodb:GetItem', etc.).

_Returns_

- [`Grant`](aws-cdk-lib.aws_iam.Grant.html)

Adds an IAM policy statement associated with this table to an IAM principal's policy.

Note: If `encryptionKey` is present, appropriate grants to the key needs to be added separately using the `table.encryptionKey.grant*` methods.

---

### [](#grantwbrfullwbraccessgrantee)grantFullAccess(grantee)

    public grantFullAccess(grantee: IGrantable): Grant

_Parameters_

- **grantee** [`IGrantable`](aws-cdk-lib.aws_iam.IGrantable.html) — the principal to grant access to.

_Returns_

- [`Grant`](aws-cdk-lib.aws_iam.Grant.html)

Permits an IAM principal to all DynamoDB operations ('dynamodb:\*') on this table.

Note: Appropriate grants will also be added to the customer-managed KMS keys associated with this table if one was configured.

---

### [](#grantwbrreadwbrdatagrantee)grantReadData(grantee)

    public grantReadData(grantee: IGrantable): Grant

_Parameters_

- **grantee** [`IGrantable`](aws-cdk-lib.aws_iam.IGrantable.html) — the principal to grant access to.

_Returns_

- [`Grant`](aws-cdk-lib.aws_iam.Grant.html)

Permits an IAM principal all data read operations on this table.

Actions: BatchGetItem, GetRecords, GetShardIterator, Query, GetItem, Scan, DescribeTable.

Note: Appropriate grants will also be added to the customer-managed KMS keys associated with this table if one was configured.

---

### [](#grantwbrreadwbrwritewbrdatagrantee)grantReadWriteData(grantee)

    public grantReadWriteData(grantee: IGrantable): Grant

_Parameters_

- **grantee** [`IGrantable`](aws-cdk-lib.aws_iam.IGrantable.html) — the principal to grant access to.

_Returns_

- [`Grant`](aws-cdk-lib.aws_iam.Grant.html)

Permits an IAM principal to all data read/write operations on this table.

Actions: BatchGetItem, GetRecords, GetShardIterator, Query, GetItem, Scan, BatchWriteItem, PutItem, UpdateItem, DeleteItem, DescribeTable.

Note: Appropriate grants will also be added to the customer-managed KMS keys associated with this table if one was configured.

---

### [](#grantwbrstreamgrantee-actions)grantStream(grantee, ...actions)

    public grantStream(grantee: IGrantable, ...actions: string[]): Grant

_Parameters_

- **grantee** [`IGrantable`](aws-cdk-lib.aws_iam.IGrantable.html) — the principal (no-op if undefined).
- **actions** `string` — the set of actions to allow (i.e., 'dynamodb:DescribeStream', 'dynamodb:GetRecords', etc.).

_Returns_

- [`Grant`](aws-cdk-lib.aws_iam.Grant.html)

Adds an IAM policy statement associated with this table to an IAM principal's policy.

Note: If `encryptionKey` is present, appropriate grants to the key needs to be added separately using the `table.encryptionKey.grant*` methods.

---

### [](#grantwbrstreamwbrreadgrantee)grantStreamRead(grantee)

    public grantStreamRead(grantee: IGrantable): Grant

_Parameters_

- **grantee** [`IGrantable`](aws-cdk-lib.aws_iam.IGrantable.html) — the principal to grant access to.

_Returns_

- [`Grant`](aws-cdk-lib.aws_iam.Grant.html)

Adds an IAM policy statement associated with this table to an IAM principal's policy.

Actions: DescribeStream, GetRecords, GetShardIterator, ListStreams.

Note: Appropriate grants will also be added to the customer-managed KMS keys associated with this table if one was configured.

---

### [](#grantwbrtablewbrlistwbrstreamsgrantee)grantTableListStreams(grantee)

    public grantTableListStreams(grantee: IGrantable): Grant

_Parameters_

- **grantee** [`IGrantable`](aws-cdk-lib.aws_iam.IGrantable.html) — the principal to grant access to.

_Returns_

- [`Grant`](aws-cdk-lib.aws_iam.Grant.html)

Permits an IAM principal to list streams attached to this table.

---

### [](#grantwbrwritewbrdatagrantee)grantWriteData(grantee)

    public grantWriteData(grantee: IGrantable): Grant

_Parameters_

- **grantee** [`IGrantable`](aws-cdk-lib.aws_iam.IGrantable.html) — the principal to grant access to.

_Returns_

- [`Grant`](aws-cdk-lib.aws_iam.Grant.html)

Permits an IAM principal all data write operations on this table.

Actions: BatchWriteItem, PutItem, UpdateItem, DeleteItem, DescribeTable.

Note: Appropriate grants will also be added to the customer-managed KMS keys associated with this table if one was configured.

---

### [](#metricmetricname-props)metric(metricName, props?)

    public metric(metricName: string, props?: MetricOptions): Metric

_Parameters_

- **metricName** `string`
- **props** [`MetricOptions`](aws-cdk-lib.aws_cloudwatch.MetricOptions.html)

_Returns_

- [`Metric`](aws-cdk-lib.aws_cloudwatch.Metric.html)

Return the given named metric for this table.

By default, the metric will be calculated as a sum over a period of 5 minutes. You can customize this by using the `statistic` and `period` properties.

---

### [](#metricwbrconditionalwbrcheckwbrfailedwbrrequestsprops)metricConditionalCheckFailedRequests(props?)

    public metricConditionalCheckFailedRequests(props?: MetricOptions): Metric

_Parameters_

- **props** [`MetricOptions`](aws-cdk-lib.aws_cloudwatch.MetricOptions.html)

_Returns_

- [`Metric`](aws-cdk-lib.aws_cloudwatch.Metric.html)

Metric for the conditional check failed requests for this table.

By default, the metric will be calculated as a sum over a period of 5 minutes. You can customize this by using the `statistic` and `period` properties.

---

### [](#metricwbrconsumedwbrreadwbrcapacitywbrunitsprops)metricConsumedReadCapacityUnits(props?)

    public metricConsumedReadCapacityUnits(props?: MetricOptions): Metric

_Parameters_

- **props** [`MetricOptions`](aws-cdk-lib.aws_cloudwatch.MetricOptions.html)

_Returns_

- [`Metric`](aws-cdk-lib.aws_cloudwatch.Metric.html)

Metric for the consumed read capacity units for this table.

By default, the metric will be calculated as a sum over a period of 5 minutes. You can customize this by using the `statistic` and `period` properties.

---

### [](#metricwbrconsumedwbrwritewbrcapacitywbrunitsprops)metricConsumedWriteCapacityUnits(props?)

    public metricConsumedWriteCapacityUnits(props?: MetricOptions): Metric

_Parameters_

- **props** [`MetricOptions`](aws-cdk-lib.aws_cloudwatch.MetricOptions.html)

_Returns_

- [`Metric`](aws-cdk-lib.aws_cloudwatch.Metric.html)

Metric for the consumed write capacity units for this table.

By default, the metric will be calculated as a sum over a period of 5 minutes. You can customize this by using the `statistic` and `period` properties.

---

### [](#metricwbrsuccessfulwbrrequestwbrlatencyprops)metricSuccessfulRequestLatency(props?)

    public metricSuccessfulRequestLatency(props?: MetricOptions): Metric

_Parameters_

- **props** [`MetricOptions`](aws-cdk-lib.aws_cloudwatch.MetricOptions.html)

_Returns_

- [`Metric`](aws-cdk-lib.aws_cloudwatch.Metric.html)

Metric for the successful request latency for this table.

By default, the metric will be calculated as an average over a period of 5 minutes. You can customize this by using the `statistic` and `period` properties.

---

### [](#metricwbrsystemwbrerrorspropsspan-classapi-icon-api-icon-deprecated-titlethis-api-element-is-deprecated-its-use-is-not-recommended️span)metricSystemErrors(props?)⚠️

    public metricSystemErrors(props?: MetricOptions): Metric

⚠️ **Deprecated:** use `metricSystemErrorsForOperations`.

_Parameters_

- **props** [`MetricOptions`](aws-cdk-lib.aws_cloudwatch.MetricOptions.html)

_Returns_

- [`Metric`](aws-cdk-lib.aws_cloudwatch.Metric.html)

Metric for the system errors this table.

---

### [](#metricwbrsystemwbrerrorswbrforwbroperationsprops)metricSystemErrorsForOperations(props?)

    public metricSystemErrorsForOperations(props?: SystemErrorsForOperationsMetricOptions): IMetric

_Parameters_

- **props** [`SystemErrorsForOperationsMetricOptions`](aws-cdk-lib.aws_dynamodb.SystemErrorsForOperationsMetricOptions.html)

_Returns_

- [`IMetric`](aws-cdk-lib.aws_cloudwatch.IMetric.html)

Metric for the system errors for this table. This will sum errors across all possible operations.

By default, each individual metric will be calculated as a sum over a period of 5 minutes. You can customize this by using the `statistic` and `period` properties.

---

### [](#metricwbrthrottledwbrrequestspropsspan-classapi-icon-api-icon-deprecated-titlethis-api-element-is-deprecated-its-use-is-not-recommended️span)metricThrottledRequests(props?)⚠️

    public metricThrottledRequests(props?: MetricOptions): Metric

⚠️ **Deprecated:** Do not use this function. It returns an invalid metric. Use `metricThrottledRequestsForOperation` instead.

_Parameters_

- **props** [`MetricOptions`](aws-cdk-lib.aws_cloudwatch.MetricOptions.html)

_Returns_

- [`Metric`](aws-cdk-lib.aws_cloudwatch.Metric.html)

How many requests are throttled on this table.

By default, each individual metric will be calculated as a sum over a period of 5 minutes. You can customize this by using the `statistic` and `period` properties.

---

### [](#metricwbrthrottledwbrrequestswbrforwbroperationoperation-props)metricThrottledRequestsForOperation(operation, props?)

    public metricThrottledRequestsForOperation(operation: string, props?: OperationsMetricOptions): IMetric

_Parameters_

- **operation** `string`
- **props** [`OperationsMetricOptions`](aws-cdk-lib.aws_dynamodb.OperationsMetricOptions.html)

_Returns_

- [`IMetric`](aws-cdk-lib.aws_cloudwatch.IMetric.html)

How many requests are throttled on this table for the given operation.

By default, the metric will be calculated as an average over a period of 5 minutes. You can customize this by using the `statistic` and `period` properties.

---

### [](#metricwbrthrottledwbrrequestswbrforwbroperationsprops)metricThrottledRequestsForOperations(props?)

    public metricThrottledRequestsForOperations(props?: OperationsMetricOptions): IMetric

_Parameters_

- **props** [`OperationsMetricOptions`](aws-cdk-lib.aws_dynamodb.OperationsMetricOptions.html)

_Returns_

- [`IMetric`](aws-cdk-lib.aws_cloudwatch.IMetric.html)

How many requests are throttled on this table. This will sum errors across all possible operations.

By default, each individual metric will be calculated as a sum over a period of 5 minutes. You can customize this by using the `statistic` and `period` properties.

---

### [](#metricwbruserwbrerrorsprops)metricUserErrors(props?)

    public metricUserErrors(props?: MetricOptions): Metric

_Parameters_

- **props** [`MetricOptions`](aws-cdk-lib.aws_cloudwatch.MetricOptions.html)

_Returns_

- [`Metric`](aws-cdk-lib.aws_cloudwatch.Metric.html)

Metric for the user errors for this table.

Note: This metric reports user errors across all the tables in the account and region the table resides in.

By default, the metric will be calculated as a sum over a period of 5 minutes. You can customize this by using the `statistic` and `period` properties.

---

### [](#replicaregion)replica(region)

    public replica(region: string): ITableV2

_Parameters_

- **region** `string` — the region of the replica table.

_Returns_

- [`ITableV2`](aws-cdk-lib.aws_dynamodb.ITableV2.html)

Retrieve a replica table.

Note: Replica tables are not supported in a region agnostic stack.

---

### [](#towbrstring)toString()

    public toString(): string

_Returns_

- `string`

Returns a string representation of this construct.

---

### [](#static-fromwbrtablewbrarnscope-id-tablearn)static fromTableArn(scope, id, tableArn)

    public static fromTableArn(scope: Construct, id: string, tableArn: string): ITableV2

_Parameters_

- **scope** [`Construct`](constructs.Construct.html) — the parent creating construct (usually `this`).
- **id** `string` — the construct's name.
- **tableArn** `string` — the table's ARN.

_Returns_

- [`ITableV2`](aws-cdk-lib.aws_dynamodb.ITableV2.html)

Creates a Table construct that represents an external table via table ARN.

---

### [](#static-fromwbrtablewbrattributesscope-id-attrs)static fromTableAttributes(scope, id, attrs)

    public static fromTableAttributes(scope: Construct, id: string, attrs: TableAttributesV2): ITableV2

_Parameters_

- **scope** [`Construct`](constructs.Construct.html) — the parent creating construct (usually `this`).
- **id** `string` — the construct's name.
- **attrs** [`TableAttributesV2`](aws-cdk-lib.aws_dynamodb.TableAttributesV2.html) — attributes of the table.

_Returns_

- [`ITableV2`](aws-cdk-lib.aws_dynamodb.ITableV2.html)

Creates a Table construct that represents an external table.

---

### [](#static-fromwbrtablewbrnamescope-id-tablename)static fromTableName(scope, id, tableName)

    public static fromTableName(scope: Construct, id: string, tableName: string): ITableV2

_Parameters_

- **scope** [`Construct`](constructs.Construct.html) — the parent creating construct (usually `this`).
- **id** `string` — the construct's name.
- **tableName** `string` — the table's name.

_Returns_

- [`ITableV2`](aws-cdk-lib.aws_dynamodb.ITableV2.html)

Creates a Table construct that represents an external table via table name.
