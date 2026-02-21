import { S3Client } from "@aws-sdk/client-s3";
import { CloudFrontClient } from "@aws-sdk/client-cloudfront";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const region = process.env.AWS_REGION || "us-east-1";

export const s3Client = new S3Client({ region });
export const cloudFrontClient = new CloudFrontClient({ region });
export const dynamoDBClient = new DynamoDBClient({ region });
export const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

export const S3_BUCKET_NAME = "aiforvizag21022026-workvault";
export const DYNAMODB_TABLE_NAME = "AIFORVIZAG_file_structure";
