import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutCommand, QueryCommand, DeleteCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { s3Client, docClient, S3_BUCKET_NAME, DYNAMODB_TABLE_NAME } from "./config";
import { v4 as uuidv4 } from "uuid";

export function getCloudfrontUrl(s3Key: string): string {
  const cloudfrontDomain = process.env.CLOUDFRONT_DOMAIN;
  if (cloudfrontDomain) {
    return `https://${cloudfrontDomain}/${s3Key}`;
  }
  const region = process.env.AWS_REGION || "us-east-1";
  return `https://${S3_BUCKET_NAME}.s3.${region}.amazonaws.com/${s3Key}`;
}

// === Organisation ===

export async function createOrganisation(params: {
  name: string;
  description?: string;
  logo?: string;
  createdBy: string;
}) {
  const orgId = uuidv4();
  const now = new Date().toISOString();
  const item = {
    pk: `ORG#${orgId}`,
    sk: "METADATA",
    orgId,
    name: params.name,
    description: params.description || null,
    logo: params.logo || null,
    createdBy: params.createdBy,
    createdAt: now,
    updatedAt: now,
    itemType: "organisation",
  };
  await docClient.send(new PutCommand({ TableName: DYNAMODB_TABLE_NAME, Item: item }));
  return item;
}

export async function getOrganisation(orgId: string) {
  const result = await docClient.send(new GetCommand({
    TableName: DYNAMODB_TABLE_NAME,
    Key: { pk: `ORG#${orgId}`, sk: "METADATA" },
  }));
  return result.Item || null;
}

export async function getOrganisationsByUser(userId: string) {
  const result = await docClient.send(new QueryCommand({
    TableName: DYNAMODB_TABLE_NAME,
    IndexName: "createdBy-index",
    KeyConditionExpression: "createdBy = :userId",
    FilterExpression: "itemType = :itemType",
    ExpressionAttributeValues: {
      ":userId": userId,
      ":itemType": "organisation",
    },
  }));
  return result.Items || [];
}

// === Workspace ===

export async function createWorkspace(params: {
  orgId: string;
  name: string;
  description?: string;
  createdBy: string;
}) {
  const workspaceId = uuidv4();
  const now = new Date().toISOString();
  const item = {
    pk: `ORG#${params.orgId}`,
    sk: `WS#${workspaceId}`,
    orgId: params.orgId,
    id: workspaceId,
    name: params.name,
    description: params.description || null,
    createdBy: params.createdBy,
    createdAt: now,
    itemType: "workspace",
  };
  await docClient.send(new PutCommand({ TableName: DYNAMODB_TABLE_NAME, Item: item }));

  await addWorkspaceMember({
    orgId: params.orgId,
    workspaceId,
    userId: params.createdBy,
    role: "admin",
  });

  return item;
}

export async function getWorkspace(orgId: string, workspaceId: string) {
  const result = await docClient.send(new GetCommand({
    TableName: DYNAMODB_TABLE_NAME,
    Key: { pk: `ORG#${orgId}`, sk: `WS#${workspaceId}` },
  }));
  return result.Item || null;
}

export async function getWorkspacesByOrg(orgId: string) {
  const result = await docClient.send(new QueryCommand({
    TableName: DYNAMODB_TABLE_NAME,
    KeyConditionExpression: "pk = :pk AND begins_with(sk, :sk)",
    FilterExpression: "itemType = :itemType",
    ExpressionAttributeValues: {
      ":pk": `ORG#${orgId}`,
      ":sk": "WS#",
      ":itemType": "workspace",
    },
  }));
  return result.Items || [];
}

export async function getWorkspacesByUser(userId: string) {
  const { ScanCommand } = await import("@aws-sdk/lib-dynamodb");
  const scanResult = await docClient.send(new ScanCommand({
    TableName: DYNAMODB_TABLE_NAME,
    FilterExpression: "itemType = :t AND userId = :userId",
    ExpressionAttributeValues: {
      ":t": "member",
      ":userId": userId,
    },
  }));

  const members = scanResult.Items || [];
  const workspaces: any[] = [];

  for (const member of members) {
    const ws = await getWorkspace(member.orgId, member.workspaceId);
    if (ws) workspaces.push(ws);
  }

  return workspaces;
}

export async function deleteWorkspace(orgId: string, workspaceId: string) {
  const members = await getWorkspaceMembers(orgId, workspaceId);
  for (const m of members) {
    await docClient.send(new DeleteCommand({
      TableName: DYNAMODB_TABLE_NAME,
      Key: { pk: `ORG#${orgId}`, sk: m.sk },
    }));
  }

  const folders = await getFoldersByWorkspace(orgId, workspaceId);
  for (const f of folders) {
    await deleteFolderAndFiles(orgId, workspaceId, f.id);
  }

  await docClient.send(new DeleteCommand({
    TableName: DYNAMODB_TABLE_NAME,
    Key: { pk: `ORG#${orgId}`, sk: `WS#${workspaceId}` },
  }));
}

// === Members ===

export async function addWorkspaceMember(params: {
  orgId: string;
  workspaceId: string;
  userId: string;
  role: string;
}) {
  const memberId = uuidv4();
  const now = new Date().toISOString();
  const item = {
    pk: `ORG#${params.orgId}`,
    sk: `WS#${params.workspaceId}#MEMBER#${params.userId}`,
    id: memberId,
    orgId: params.orgId,
    workspaceId: params.workspaceId,
    userId: params.userId,
    role: params.role,
    addedAt: now,
    itemType: "member",
  };
  await docClient.send(new PutCommand({ TableName: DYNAMODB_TABLE_NAME, Item: item }));
  return item;
}

export async function getWorkspaceMembers(orgId: string, workspaceId: string) {
  const result = await docClient.send(new QueryCommand({
    TableName: DYNAMODB_TABLE_NAME,
    KeyConditionExpression: "pk = :pk AND begins_with(sk, :sk)",
    FilterExpression: "itemType = :itemType",
    ExpressionAttributeValues: {
      ":pk": `ORG#${orgId}`,
      ":sk": `WS#${workspaceId}#MEMBER#`,
      ":itemType": "member",
    },
  }));
  return result.Items || [];
}

export async function getMemberByUserAndWorkspace(orgId: string, workspaceId: string, userId: string) {
  const result = await docClient.send(new GetCommand({
    TableName: DYNAMODB_TABLE_NAME,
    Key: { pk: `ORG#${orgId}`, sk: `WS#${workspaceId}#MEMBER#${userId}` },
  }));
  return result.Item || null;
}

export async function removeWorkspaceMember(orgId: string, workspaceId: string, userId: string) {
  await docClient.send(new DeleteCommand({
    TableName: DYNAMODB_TABLE_NAME,
    Key: { pk: `ORG#${orgId}`, sk: `WS#${workspaceId}#MEMBER#${userId}` },
  }));
}

// === Folders ===

export async function createFolder(params: {
  orgId: string;
  workspaceId: string;
  name: string;
  parentId?: string | null;
  createdBy: string;
}) {
  const folderId = uuidv4();
  const now = new Date().toISOString();
  const item = {
    pk: `ORG#${params.orgId}`,
    sk: `WS#${params.workspaceId}#FOLDER#${folderId}`,
    id: folderId,
    orgId: params.orgId,
    workspaceId: params.workspaceId,
    name: params.name,
    parentId: params.parentId || null,
    createdBy: params.createdBy,
    createdAt: now,
    itemType: "folder",
  };
  await docClient.send(new PutCommand({ TableName: DYNAMODB_TABLE_NAME, Item: item }));
  return item;
}

export async function getFoldersByWorkspace(orgId: string, workspaceId: string) {
  const result = await docClient.send(new QueryCommand({
    TableName: DYNAMODB_TABLE_NAME,
    KeyConditionExpression: "pk = :pk AND begins_with(sk, :sk)",
    FilterExpression: "itemType = :itemType",
    ExpressionAttributeValues: {
      ":pk": `ORG#${orgId}`,
      ":sk": `WS#${workspaceId}#FOLDER#`,
      ":itemType": "folder",
    },
  }));
  return result.Items || [];
}

export async function getFolder(orgId: string, workspaceId: string, folderId: string) {
  const result = await docClient.send(new GetCommand({
    TableName: DYNAMODB_TABLE_NAME,
    Key: { pk: `ORG#${orgId}`, sk: `WS#${workspaceId}#FOLDER#${folderId}` },
  }));
  return result.Item || null;
}

// === Files ===

export async function uploadTextToS3(orgId: string, text: string, fileName?: string): Promise<{ s3Key: string; cloudfrontUrl: string }> {
  const name = fileName || `text-brief-${Date.now()}.txt`;
  const sanitizedName = name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const uniqueName = `${Date.now()}-${sanitizedName}`;
  const s3Key = `${orgId}/briefs/${uniqueName}`;

  await s3Client.send(new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: s3Key,
    Body: text,
    ContentType: "text/plain",
  }));

  const cloudfrontUrl = getCloudfrontUrl(s3Key);
  return { s3Key, cloudfrontUrl };
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

export async function createFile(params: {
  orgId: string;
  workspaceId: string;
  folderId: string;
  name: string;
  type: string;
  objectPath: string;
  size: number;
  createdBy: string;
}) {
  const fileId = uuidv4();
  const now = new Date().toISOString();
  const item = {
    pk: `ORG#${params.orgId}`,
    sk: `WS#${params.workspaceId}#FOLDER#${params.folderId}#FILE#${fileId}`,
    id: fileId,
    orgId: params.orgId,
    workspaceId: params.workspaceId,
    folderId: params.folderId,
    name: params.name,
    type: params.type,
    objectPath: params.objectPath,
    size: params.size,
    createdBy: params.createdBy,
    createdAt: now,
    itemType: "file",
  };
  await docClient.send(new PutCommand({ TableName: DYNAMODB_TABLE_NAME, Item: item }));
  return item;
}

export async function getFilesByFolder(orgId: string, workspaceId: string, folderId: string) {
  const result = await docClient.send(new QueryCommand({
    TableName: DYNAMODB_TABLE_NAME,
    KeyConditionExpression: "pk = :pk AND begins_with(sk, :sk)",
    FilterExpression: "itemType = :itemType",
    ExpressionAttributeValues: {
      ":pk": `ORG#${orgId}`,
      ":sk": `WS#${workspaceId}#FOLDER#${folderId}#FILE#`,
      ":itemType": "file",
    },
  }));
  return result.Items || [];
}

export async function deleteFileFromS3(s3Key: string): Promise<void> {
  await s3Client.send(new DeleteObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: s3Key,
  }));
}

export async function deleteFile(orgId: string, workspaceId: string, folderId: string, fileId: string) {
  const file = await docClient.send(new GetCommand({
    TableName: DYNAMODB_TABLE_NAME,
    Key: { pk: `ORG#${orgId}`, sk: `WS#${workspaceId}#FOLDER#${folderId}#FILE#${fileId}` },
  }));
  if (file.Item?.objectPath) {
    try {
      let s3Key = file.Item.objectPath;
      if (s3Key.startsWith("https://")) {
        const url = new URL(s3Key);
        s3Key = url.pathname.startsWith("/") ? url.pathname.slice(1) : url.pathname;
      }
      await deleteFileFromS3(s3Key);
    } catch (e) {
      console.error("[AWS] Error deleting S3 object:", e);
    }
  }
  await docClient.send(new DeleteCommand({
    TableName: DYNAMODB_TABLE_NAME,
    Key: { pk: `ORG#${orgId}`, sk: `WS#${workspaceId}#FOLDER#${folderId}#FILE#${fileId}` },
  }));
}

export async function deleteFolderAndFiles(orgId: string, workspaceId: string, folderId: string) {
  const files = await getFilesByFolder(orgId, workspaceId, folderId);
  for (const file of files) {
    await deleteFile(orgId, workspaceId, folderId, file.id);
  }

  const allFolders = await getFoldersByWorkspace(orgId, workspaceId);
  const children = allFolders.filter((f: any) => f.parentId === folderId);
  for (const child of children) {
    await deleteFolderAndFiles(orgId, workspaceId, child.id);
  }

  await docClient.send(new DeleteCommand({
    TableName: DYNAMODB_TABLE_NAME,
    Key: { pk: `ORG#${orgId}`, sk: `WS#${workspaceId}#FOLDER#${folderId}` },
  }));
}

// === Interrogation ===

export async function createInterrogation(params: {
  orgId: string;
  workspaceId: string;
  summary: string;
  fileUrls: string[];
  createdBy: string;
}) {
  const id = uuidv4();
  const now = new Date().toISOString();
  const item = {
    pk: `ORG#${params.orgId}`,
    sk: `WS#${params.workspaceId}#INTERROGATION#${id}`,
    id,
    orgId: params.orgId,
    workspaceId: params.workspaceId,
    summary: params.summary,
    fileUrls: params.fileUrls,
    briefingAnswers: {},
    status: "analysed",
    createdBy: params.createdBy,
    createdAt: now,
    updatedAt: now,
    itemType: "interrogation",
  };
  await docClient.send(new PutCommand({ TableName: DYNAMODB_TABLE_NAME, Item: item }));
  return item;
}

export async function getInterrogation(orgId: string, workspaceId: string, interrogationId: string) {
  const result = await docClient.send(new GetCommand({
    TableName: DYNAMODB_TABLE_NAME,
    Key: { pk: `ORG#${orgId}`, sk: `WS#${workspaceId}#INTERROGATION#${interrogationId}` },
  }));
  return result.Item || null;
}

export async function updateInterrogation(orgId: string, workspaceId: string, interrogationId: string, updates: {
  briefingAnswers?: Record<string, any>;
  status?: string;
  summary?: string;
  finalDocument?: string;
}) {
  const expressions: string[] = [];
  const names: Record<string, string> = {};
  const values: Record<string, any> = {};

  if (updates.briefingAnswers !== undefined) {
    expressions.push("#ba = :ba");
    names["#ba"] = "briefingAnswers";
    values[":ba"] = updates.briefingAnswers;
  }
  if (updates.status !== undefined) {
    expressions.push("#st = :st");
    names["#st"] = "status";
    values[":st"] = updates.status;
  }
  if (updates.summary !== undefined) {
    expressions.push("#sm = :sm");
    names["#sm"] = "summary";
    values[":sm"] = updates.summary;
  }
  if (updates.finalDocument !== undefined) {
    expressions.push("#fd = :fd");
    names["#fd"] = "finalDocument";
    values[":fd"] = updates.finalDocument;
  }
  expressions.push("#ua = :ua");
  names["#ua"] = "updatedAt";
  values[":ua"] = new Date().toISOString();

  await docClient.send(new UpdateCommand({
    TableName: DYNAMODB_TABLE_NAME,
    Key: { pk: `ORG#${orgId}`, sk: `WS#${workspaceId}#INTERROGATION#${interrogationId}` },
    UpdateExpression: `SET ${expressions.join(", ")}`,
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: values,
  }));
}

export async function getInterrogationsByWorkspace(orgId: string, workspaceId: string) {
  const result = await docClient.send(new QueryCommand({
    TableName: DYNAMODB_TABLE_NAME,
    KeyConditionExpression: "pk = :pk AND begins_with(sk, :skPrefix)",
    ExpressionAttributeValues: {
      ":pk": `ORG#${orgId}`,
      ":skPrefix": `WS#${workspaceId}#INTERROGATION#`,
    },
  }));
  return (result.Items || []) as any[];
}

// === Tasks ===

export async function createTask(params: {
  orgId: string;
  workspaceId: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  sourceInterrogationId?: string;
  assignees?: string[];
  createdBy: string;
}) {
  const id = uuidv4();
  const now = new Date().toISOString();
  const item = {
    pk: `ORG#${params.orgId}`,
    sk: `WS#${params.workspaceId}#TASK#${id}`,
    id,
    orgId: params.orgId,
    workspaceId: params.workspaceId,
    title: params.title,
    description: params.description,
    status: params.status || "todo",
    priority: params.priority || "medium",
    sourceInterrogationId: params.sourceInterrogationId || null,
    assignees: params.assignees || [],
    createdBy: params.createdBy,
    createdAt: now,
    updatedAt: now,
    itemType: "task",
  };
  await docClient.send(new PutCommand({ TableName: DYNAMODB_TABLE_NAME, Item: item }));
  return item;
}

export async function getTasksByWorkspace(orgId: string, workspaceId: string) {
  const result = await docClient.send(new QueryCommand({
    TableName: DYNAMODB_TABLE_NAME,
    KeyConditionExpression: "pk = :pk AND begins_with(sk, :skPrefix)",
    ExpressionAttributeValues: {
      ":pk": `ORG#${orgId}`,
      ":skPrefix": `WS#${workspaceId}#TASK#`,
    },
  }));
  const items = (result.Items || []) as any[];
  return items.filter(i => i.itemType === "task");
}

export async function updateTask(orgId: string, workspaceId: string, taskId: string, updates: {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  assignees?: string[];
  videoUrl?: string;
}) {
  const expressions: string[] = [];
  const names: Record<string, string> = {};
  const values: Record<string, any> = {};

  if (updates.title !== undefined) { expressions.push("#t = :t"); names["#t"] = "title"; values[":t"] = updates.title; }
  if (updates.description !== undefined) { expressions.push("#d = :d"); names["#d"] = "description"; values[":d"] = updates.description; }
  if (updates.status !== undefined) { expressions.push("#s = :s"); names["#s"] = "status"; values[":s"] = updates.status; }
  if (updates.priority !== undefined) { expressions.push("#p = :p"); names["#p"] = "priority"; values[":p"] = updates.priority; }
  if (updates.assignees !== undefined) { expressions.push("#a = :a"); names["#a"] = "assignees"; values[":a"] = updates.assignees; }
  if (updates.videoUrl !== undefined) { expressions.push("#vu = :vu"); names["#vu"] = "videoUrl"; values[":vu"] = updates.videoUrl; }
  expressions.push("#ua = :ua"); names["#ua"] = "updatedAt"; values[":ua"] = new Date().toISOString();

  if (expressions.length === 1) return;

  await docClient.send(new UpdateCommand({
    TableName: DYNAMODB_TABLE_NAME,
    Key: { pk: `ORG#${orgId}`, sk: `WS#${workspaceId}#TASK#${taskId}` },
    UpdateExpression: `SET ${expressions.join(", ")}`,
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: values,
  }));
}

export async function deleteTask(orgId: string, workspaceId: string, taskId: string) {
  await docClient.send(new DeleteCommand({
    TableName: DYNAMODB_TABLE_NAME,
    Key: { pk: `ORG#${orgId}`, sk: `WS#${workspaceId}#TASK#${taskId}` },
  }));
}

// === Task Comments ===

export async function createTaskComment(params: {
  orgId: string;
  workspaceId: string;
  taskId: string;
  authorId: string;
  authorEmail?: string;
  text: string;
  timestampSec?: number;
}) {
  const id = uuidv4();
  const now = new Date().toISOString();
  const item = {
    pk: `ORG#${params.orgId}`,
    sk: `WS#${params.workspaceId}#TASK#${params.taskId}#COMMENT#${id}`,
    id,
    orgId: params.orgId,
    workspaceId: params.workspaceId,
    taskId: params.taskId,
    authorId: params.authorId,
    authorEmail: params.authorEmail || null,
    text: params.text,
    timestampSec: params.timestampSec ?? null,
    createdAt: now,
    itemType: "comment",
  };
  await docClient.send(new PutCommand({ TableName: DYNAMODB_TABLE_NAME, Item: item }));
  return item;
}

export async function getTaskComments(orgId: string, workspaceId: string, taskId: string) {
  const result = await docClient.send(new QueryCommand({
    TableName: DYNAMODB_TABLE_NAME,
    KeyConditionExpression: "pk = :pk AND begins_with(sk, :skPrefix)",
    ExpressionAttributeValues: {
      ":pk": `ORG#${orgId}`,
      ":skPrefix": `WS#${workspaceId}#TASK#${taskId}#COMMENT#`,
    },
  }));
  return (result.Items || []) as any[];
}
