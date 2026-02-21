import {
  CreateBucketCommand,
  PutBucketPolicyCommand,
  PutPublicAccessBlockCommand,
  HeadBucketCommand,
  DeletePublicAccessBlockCommand,
  PutBucketCorsCommand,
} from "@aws-sdk/client-s3";
import {
  CreateDistributionCommand,
  ListDistributionsCommand,
} from "@aws-sdk/client-cloudfront";
import {
  CreateTableCommand,
  DescribeTableCommand,
  UpdateTableCommand,
  ResourceInUseException,
} from "@aws-sdk/client-dynamodb";
import { s3Client, cloudFrontClient, dynamoDBClient, S3_BUCKET_NAME, DYNAMODB_TABLE_NAME } from "./config";

export async function setupAWSInfrastructure() {
  console.log("[AWS] Starting infrastructure setup...");

  const bucketCreated = await createS3Bucket();
  const tableCreated = await createDynamoDBTable();

  if (process.env.CLOUDFRONT_DOMAIN) {
    console.log(`[AWS] Using existing CloudFront domain: ${process.env.CLOUDFRONT_DOMAIN}`);
  } else {
    const cloudfrontDomain = await setupCloudFront();
    if (cloudfrontDomain) {
      process.env.CLOUDFRONT_DOMAIN = cloudfrontDomain;
      console.log(`[AWS] CloudFront domain: ${cloudfrontDomain}`);
    }
  }

  console.log("[AWS] Infrastructure setup complete.");
  return { bucketCreated, cloudfrontDomain: process.env.CLOUDFRONT_DOMAIN || null, tableCreated };
}

async function createS3Bucket(): Promise<boolean> {
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: S3_BUCKET_NAME }));
    console.log(`[AWS] S3 bucket '${S3_BUCKET_NAME}' already exists.`);
    return true;
  } catch (err: any) {
    if (err.name === "NotFound" || err.$metadata?.httpStatusCode === 404 || err.$metadata?.httpStatusCode === 403) {
      console.log(`[AWS] Creating S3 bucket '${S3_BUCKET_NAME}'...`);
    } else {
      console.log(`[AWS] Bucket check error: ${err.name}, attempting creation...`);
    }
  }

  try {
    const region = process.env.AWS_REGION || "us-east-1";
    const createParams: any = { Bucket: S3_BUCKET_NAME };
    if (region !== "us-east-1") {
      createParams.CreateBucketConfiguration = { LocationConstraint: region };
    }
    await s3Client.send(new CreateBucketCommand(createParams));
    console.log(`[AWS] S3 bucket '${S3_BUCKET_NAME}' created.`);
  } catch (err: any) {
    if (err.name === "BucketAlreadyOwnedByYou") {
      console.log(`[AWS] S3 bucket '${S3_BUCKET_NAME}' already owned by you.`);
    } else {
      console.error(`[AWS] Error creating S3 bucket: ${err.message}`);
      return false;
    }
  }

  try {
    await s3Client.send(new DeletePublicAccessBlockCommand({ Bucket: S3_BUCKET_NAME }));
    console.log(`[AWS] Removed public access block from '${S3_BUCKET_NAME}'.`);
  } catch (err: any) {
    console.log(`[AWS] Public access block removal: ${err.message}`);
  }

  try {
    await s3Client.send(new PutPublicAccessBlockCommand({
      Bucket: S3_BUCKET_NAME,
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: false,
        IgnorePublicAcls: false,
        BlockPublicPolicy: false,
        RestrictPublicBuckets: false,
      },
    }));
    console.log(`[AWS] Public access block configured for '${S3_BUCKET_NAME}'.`);
  } catch (err: any) {
    console.error(`[AWS] Error setting public access block: ${err.message}`);
  }

  try {
    const bucketPolicy = {
      Version: "2012-10-17",
      Statement: [
        {
          Sid: "PublicReadGetObject",
          Effect: "Allow",
          Principal: "*",
          Action: "s3:GetObject",
          Resource: `arn:aws:s3:::${S3_BUCKET_NAME}/*`,
        },
      ],
    };
    await s3Client.send(new PutBucketPolicyCommand({
      Bucket: S3_BUCKET_NAME,
      Policy: JSON.stringify(bucketPolicy),
    }));
    console.log(`[AWS] Public read policy set on '${S3_BUCKET_NAME}'.`);
  } catch (err: any) {
    console.error(`[AWS] Error setting bucket policy: ${err.message}`);
  }

  try {
    await s3Client.send(new PutBucketCorsCommand({
      Bucket: S3_BUCKET_NAME,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ["*"],
            AllowedMethods: ["GET", "PUT", "POST"],
            AllowedOrigins: ["*"],
            ExposeHeaders: ["ETag"],
            MaxAgeSeconds: 3600,
          },
        ],
      },
    }));
    console.log(`[AWS] CORS configured for '${S3_BUCKET_NAME}'.`);
  } catch (err: any) {
    console.error(`[AWS] Error setting CORS: ${err.message}`);
  }

  return true;
}

async function setupCloudFront(): Promise<string | null> {
  try {
    const distributions = await cloudFrontClient.send(new ListDistributionsCommand({}));
    const existing = distributions.DistributionList?.Items?.find(
      (d) => d.Origins?.Items?.some((o) => o.DomainName === `${S3_BUCKET_NAME}.s3.amazonaws.com`)
    );

    if (existing) {
      console.log(`[AWS] CloudFront distribution already exists: ${existing.DomainName}`);
      return existing.DomainName || null;
    }
  } catch (err: any) {
    console.log(`[AWS] Error checking CloudFront distributions: ${err.message}`);
  }

  try {
    const region = process.env.AWS_REGION || "us-east-1";
    const s3DomainName = region === "us-east-1"
      ? `${S3_BUCKET_NAME}.s3.amazonaws.com`
      : `${S3_BUCKET_NAME}.s3.${region}.amazonaws.com`;

    const result = await cloudFrontClient.send(new CreateDistributionCommand({
      DistributionConfig: {
        CallerReference: `${S3_BUCKET_NAME}-${Date.now()}`,
        Comment: `CloudFront for ${S3_BUCKET_NAME}`,
        Enabled: true,
        Origins: {
          Quantity: 1,
          Items: [
            {
              Id: `S3-${S3_BUCKET_NAME}`,
              DomainName: s3DomainName,
              CustomOriginConfig: {
                HTTPPort: 80,
                HTTPSPort: 443,
                OriginProtocolPolicy: "http-only",
              },
            },
          ],
        },
        DefaultCacheBehavior: {
          TargetOriginId: `S3-${S3_BUCKET_NAME}`,
          ViewerProtocolPolicy: "redirect-to-https",
          AllowedMethods: {
            Quantity: 2,
            Items: ["GET", "HEAD"],
          },
          ForwardedValues: {
            QueryString: false,
            Cookies: { Forward: "none" },
          },
          MinTTL: 0,
          DefaultTTL: 86400,
          MaxTTL: 31536000,
          Compress: true,
        },
        PriceClass: "PriceClass_100",
      },
    }));

    const domain = result.Distribution?.DomainName || null;
    console.log(`[AWS] CloudFront distribution created: ${domain}`);
    return domain;
  } catch (err: any) {
    console.error(`[AWS] Error creating CloudFront distribution: ${err.message}`);
    return null;
  }
}

async function createDynamoDBTable(): Promise<boolean> {
  let tableExists = false;
  try {
    const desc = await dynamoDBClient.send(new DescribeTableCommand({ TableName: DYNAMODB_TABLE_NAME }));
    console.log(`[AWS] DynamoDB table '${DYNAMODB_TABLE_NAME}' already exists.`);
    tableExists = true;

    const existingGSIs = desc.Table?.GlobalSecondaryIndexes?.map(g => g.IndexName) || [];
    const neededGSIs = [
      { name: "createdBy-index", hashKey: "createdBy" },
    ];

    for (const gsi of neededGSIs) {
      if (!existingGSIs.includes(gsi.name)) {
        try {
          await dynamoDBClient.send(new UpdateTableCommand({
            TableName: DYNAMODB_TABLE_NAME,
            AttributeDefinitions: [
              { AttributeName: gsi.hashKey, AttributeType: "S" },
            ],
            GlobalSecondaryIndexUpdates: [
              {
                Create: {
                  IndexName: gsi.name,
                  KeySchema: [
                    { AttributeName: gsi.hashKey, KeyType: "HASH" },
                  ],
                  Projection: { ProjectionType: "ALL" },
                  ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
                },
              },
            ],
          }));
          console.log(`[AWS] Added GSI '${gsi.name}' to '${DYNAMODB_TABLE_NAME}'.`);
          await new Promise(r => setTimeout(r, 5000));
        } catch (gsiErr: any) {
          if (gsiErr.message?.includes("already exists")) {
            console.log(`[AWS] GSI '${gsi.name}' already exists.`);
          } else {
            console.error(`[AWS] Error adding GSI '${gsi.name}': ${gsiErr.message}`);
          }
        }
      }
    }

    return true;
  } catch (err: any) {
    if (err.name !== "ResourceNotFoundException") {
      console.error(`[AWS] Error checking DynamoDB table: ${err.message}`);
      return false;
    }
  }

  try {
    await dynamoDBClient.send(new CreateTableCommand({
      TableName: DYNAMODB_TABLE_NAME,
      KeySchema: [
        { AttributeName: "pk", KeyType: "HASH" },
        { AttributeName: "sk", KeyType: "RANGE" },
      ],
      AttributeDefinitions: [
        { AttributeName: "pk", AttributeType: "S" },
        { AttributeName: "sk", AttributeType: "S" },
        { AttributeName: "orgId", AttributeType: "S" },
        { AttributeName: "createdBy", AttributeType: "S" },
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: "orgId-index",
          KeySchema: [
            { AttributeName: "orgId", KeyType: "HASH" },
            { AttributeName: "sk", KeyType: "RANGE" },
          ],
          Projection: { ProjectionType: "ALL" },
          ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
        },
        {
          IndexName: "createdBy-index",
          KeySchema: [
            { AttributeName: "createdBy", KeyType: "HASH" },
          ],
          Projection: { ProjectionType: "ALL" },
          ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
        },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    }));
    console.log(`[AWS] DynamoDB table '${DYNAMODB_TABLE_NAME}' created.`);
    return true;
  } catch (err: any) {
    if (err instanceof ResourceInUseException) {
      console.log(`[AWS] DynamoDB table '${DYNAMODB_TABLE_NAME}' already exists.`);
      return true;
    }
    console.error(`[AWS] Error creating DynamoDB table: ${err.message}`);
    return false;
  }
}
