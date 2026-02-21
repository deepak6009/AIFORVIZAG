import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutCommand, QueryCommand, DeleteCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { s3Client, docClient, S3_BUCKET_NAME, DYNAMODB_TABLE_NAME } from "./config";
import { v4 as uuidv4 } from "uuid";

export interface FileMetadata {
  pk: string;
  sk: string;
  fileId: string;
  orgId: string;
  folderId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  s3Key: string;
  cloudfrontUrl: string;
  uploadedBy: string;
  createdAt: string;
  itemType: "file" | "folder";
}

export interface FolderMetadata {
  pk: string;
  sk: string;
  folderId: string;
  orgId: string;
  parentFolderId: string | null;
  folderName: string;
  createdBy: string;
  createdAt: string;
  itemType: "folder";
}

export function getCloudfrontUrl(s3Key: string): string {
  const cloudfrontDomain = process.env.CLOUDFRONT_DOMAIN;
  if (cloudfrontDomain) {
    return `https://${cloudfrontDomain}/${s3Key}`;
  }
  const region = process.env.AWS_REGION || "us-east-1";
  return `https://${S3_BUCKET_NAME}.s3.${region}.amazonaws.com/${s3Key}`;
}

export async function getPresignedUploadUrl(orgId: string, fileName: string, fileType: string): Promise<{ uploadUrl: string; s3Key: string; cloudfrontUrl: string }> {
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const uniqueName = `${Date.now()}-${sanitizedName}`;
  const s3Key = `${orgId}/${uniqueName}`;

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: s3Key,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  const cloudfrontUrl = getCloudfrontUrl(s3Key);

  return { uploadUrl, s3Key, cloudfrontUrl };
}

export async function saveFileMetadata(params: {
  orgId: string;
  folderId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  s3Key: string;
  cloudfrontUrl: string;
  uploadedBy: string;
}): Promise<FileMetadata> {
  const fileId = uuidv4();
  const now = new Date().toISOString();

  const item: FileMetadata = {
    pk: `ORG#${params.orgId}`,
    sk: `FOLDER#${params.folderId}#FILE#${fileId}`,
    fileId,
    orgId: params.orgId,
    folderId: params.folderId,
    fileName: params.fileName,
    fileType: params.fileType,
    fileSize: params.fileSize,
    s3Key: params.s3Key,
    cloudfrontUrl: params.cloudfrontUrl,
    uploadedBy: params.uploadedBy,
    createdAt: now,
    itemType: "file",
  };

  await docClient.send(new PutCommand({
    TableName: DYNAMODB_TABLE_NAME,
    Item: item,
  }));

  return item;
}

export async function saveFolderMetadata(params: {
  orgId: string;
  folderName: string;
  parentFolderId: string | null;
  createdBy: string;
}): Promise<FolderMetadata> {
  const folderId = uuidv4();
  const now = new Date().toISOString();

  const item: FolderMetadata = {
    pk: `ORG#${params.orgId}`,
    sk: `FOLDER#${folderId}`,
    folderId,
    orgId: params.orgId,
    parentFolderId: params.parentFolderId,
    folderName: params.folderName,
    createdBy: params.createdBy,
    createdAt: now,
    itemType: "folder",
  };

  await docClient.send(new PutCommand({
    TableName: DYNAMODB_TABLE_NAME,
    Item: item,
  }));

  return item;
}

export async function getFilesByFolder(orgId: string, folderId: string): Promise<FileMetadata[]> {
  const result = await docClient.send(new QueryCommand({
    TableName: DYNAMODB_TABLE_NAME,
    KeyConditionExpression: "pk = :pk AND begins_with(sk, :sk)",
    ExpressionAttributeValues: {
      ":pk": `ORG#${orgId}`,
      ":sk": `FOLDER#${folderId}#FILE#`,
    },
  }));

  return (result.Items || []) as FileMetadata[];
}

export async function getFoldersByOrg(orgId: string): Promise<FolderMetadata[]> {
  const result = await docClient.send(new QueryCommand({
    TableName: DYNAMODB_TABLE_NAME,
    KeyConditionExpression: "pk = :pk AND begins_with(sk, :sk)",
    FilterExpression: "itemType = :itemType",
    ExpressionAttributeValues: {
      ":pk": `ORG#${orgId}`,
      ":sk": "FOLDER#",
      ":itemType": "folder",
    },
  }));

  return (result.Items || []) as FolderMetadata[];
}

export async function getAllFilesByOrg(orgId: string): Promise<FileMetadata[]> {
  const result = await docClient.send(new QueryCommand({
    TableName: DYNAMODB_TABLE_NAME,
    KeyConditionExpression: "pk = :pk",
    FilterExpression: "itemType = :itemType",
    ExpressionAttributeValues: {
      ":pk": `ORG#${orgId}`,
      ":itemType": "file",
    },
  }));

  return (result.Items || []) as FileMetadata[];
}

export async function deleteFileFromS3(s3Key: string): Promise<void> {
  await s3Client.send(new DeleteObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: s3Key,
  }));
}

export async function deleteFileMetadata(orgId: string, folderId: string, fileId: string): Promise<void> {
  await docClient.send(new DeleteCommand({
    TableName: DYNAMODB_TABLE_NAME,
    Key: {
      pk: `ORG#${orgId}`,
      sk: `FOLDER#${folderId}#FILE#${fileId}`,
    },
  }));
}

export async function deleteFolderMetadata(orgId: string, folderId: string): Promise<void> {
  const files = await getFilesByFolder(orgId, folderId);
  for (const file of files) {
    await deleteFileFromS3(file.s3Key);
    await deleteFileMetadata(orgId, folderId, file.fileId);
  }

  await docClient.send(new DeleteCommand({
    TableName: DYNAMODB_TABLE_NAME,
    Key: {
      pk: `ORG#${orgId}`,
      sk: `FOLDER#${folderId}`,
    },
  }));
}
