export * from "./models/auth";

export interface Workspace {
  id: string;
  orgId: string;
  name: string;
  description: string | null;
  createdBy: string;
  createdAt: string;
}

export interface WorkspaceMember {
  id: string;
  orgId: string;
  workspaceId: string;
  userId: string;
  role: string;
  addedAt: string;
}

export interface Folder {
  id: string;
  orgId: string;
  workspaceId: string;
  name: string;
  parentId: string | null;
  createdBy: string;
  createdAt: string;
}

export interface FileRecord {
  id: string;
  orgId: string;
  workspaceId: string;
  folderId: string;
  name: string;
  type: string;
  objectPath: string;
  size: number;
  createdBy: string;
  createdAt: string;
}

export interface Organisation {
  orgId: string;
  name: string;
  description: string | null;
  logo: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "high" | "medium" | "low";

export interface Task {
  id: string;
  orgId: string;
  workspaceId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  sourceInterrogationId?: string;
  assignees?: string[];
  videoUrl?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskComment {
  id: string;
  orgId: string;
  workspaceId: string;
  taskId: string;
  authorId: string;
  authorEmail?: string;
  text: string;
  timestampSec?: number;
  createdAt: string;
}

export interface Interrogation {
  id: string;
  orgId: string;
  workspaceId: string;
  summary: string;
  fileUrls: string[];
  briefingAnswers: Record<string, any>;
  finalDocument?: string;
  status: "analysed" | "briefing" | "completed";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
