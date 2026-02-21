import {
  workspaces, workspaceMembers, folders, files,
  AIFORVIZAG_organisations,
  type Workspace, type InsertWorkspace,
  type Folder, type InsertFolder,
  type FileRecord, type InsertFile,
  type WorkspaceMember, type InsertMember,
  type Organisation, type InsertOrganisation,
} from "@shared/schema";
import { users, type User } from "@shared/models/auth";
import { db } from "./db";
import { eq, and, isNull } from "drizzle-orm";

export interface IStorage {
  createOrganisation(data: InsertOrganisation & { createdBy: string }): Promise<Organisation>;
  getOrganisationsByUser(userId: string): Promise<Organisation[]>;
  getOrganisation(id: string): Promise<Organisation | undefined>;

  createWorkspace(data: InsertWorkspace & { createdBy: string }): Promise<Workspace>;
  getWorkspacesByUser(userId: string): Promise<Workspace[]>;
  getWorkspace(id: string): Promise<Workspace | undefined>;
  deleteWorkspace(id: string): Promise<void>;

  addMember(data: InsertMember): Promise<WorkspaceMember>;
  getMembers(workspaceId: string): Promise<(WorkspaceMember & { user: User })[]>;
  removeMember(id: string): Promise<void>;
  getMemberByUserAndWorkspace(userId: string, workspaceId: string): Promise<WorkspaceMember | undefined>;

  createFolder(data: InsertFolder & { createdBy: string }): Promise<Folder>;
  getFolders(workspaceId: string): Promise<Folder[]>;
  getFolder(id: string): Promise<Folder | undefined>;
  deleteFolder(id: string): Promise<void>;

  createFile(data: InsertFile & { createdBy: string }): Promise<FileRecord>;
  getFilesByFolder(folderId: string): Promise<FileRecord[]>;
  getFile(id: string): Promise<FileRecord | undefined>;
  deleteFile(id: string): Promise<void>;

  getUserByEmail(email: string): Promise<User | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createOrganisation(data: InsertOrganisation & { createdBy: string }): Promise<Organisation> {
    const [org] = await db.insert(AIFORVIZAG_organisations).values(data).returning();
    return org;
  }

  async getOrganisationsByUser(userId: string): Promise<Organisation[]> {
    return db.select().from(AIFORVIZAG_organisations).where(eq(AIFORVIZAG_organisations.createdBy, userId));
  }

  async getOrganisation(id: string): Promise<Organisation | undefined> {
    const [org] = await db.select().from(AIFORVIZAG_organisations).where(eq(AIFORVIZAG_organisations.orgId, id));
    return org;
  }

  async createWorkspace(data: InsertWorkspace & { createdBy: string }): Promise<Workspace> {
    const [workspace] = await db.insert(workspaces).values(data).returning();
    await db.insert(workspaceMembers).values({
      workspaceId: workspace.id,
      userId: data.createdBy,
      role: "admin",
    });
    return workspace;
  }

  async getWorkspacesByUser(userId: string): Promise<Workspace[]> {
    const rows = await db
      .select({ workspace: workspaces })
      .from(workspaceMembers)
      .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
      .where(eq(workspaceMembers.userId, userId));
    return rows.map((r) => r.workspace);
  }

  async getWorkspace(id: string): Promise<Workspace | undefined> {
    const [ws] = await db.select().from(workspaces).where(eq(workspaces.id, id));
    return ws;
  }

  async deleteWorkspace(id: string): Promise<void> {
    await db.delete(workspaces).where(eq(workspaces.id, id));
  }

  async addMember(data: InsertMember): Promise<WorkspaceMember> {
    const [member] = await db.insert(workspaceMembers).values(data).returning();
    return member;
  }

  async getMembers(workspaceId: string): Promise<(WorkspaceMember & { user: User })[]> {
    const rows = await db
      .select({ member: workspaceMembers, user: users })
      .from(workspaceMembers)
      .innerJoin(users, eq(workspaceMembers.userId, users.id))
      .where(eq(workspaceMembers.workspaceId, workspaceId));
    return rows.map((r) => ({ ...r.member, user: r.user }));
  }

  async removeMember(id: string): Promise<void> {
    await db.delete(workspaceMembers).where(eq(workspaceMembers.id, id));
  }

  async getMemberByUserAndWorkspace(userId: string, workspaceId: string): Promise<WorkspaceMember | undefined> {
    const [member] = await db.select().from(workspaceMembers)
      .where(and(eq(workspaceMembers.userId, userId), eq(workspaceMembers.workspaceId, workspaceId)));
    return member;
  }

  async createFolder(data: InsertFolder & { createdBy: string }): Promise<Folder> {
    const [folder] = await db.insert(folders).values(data).returning();
    return folder;
  }

  async getFolders(workspaceId: string): Promise<Folder[]> {
    return db.select().from(folders).where(eq(folders.workspaceId, workspaceId));
  }

  async getFolder(id: string): Promise<Folder | undefined> {
    const [folder] = await db.select().from(folders).where(eq(folders.id, id));
    return folder;
  }

  async deleteFolder(id: string): Promise<void> {
    await db.delete(folders).where(eq(folders.id, id));
  }

  async createFile(data: InsertFile & { createdBy: string }): Promise<FileRecord> {
    const [file] = await db.insert(files).values(data).returning();
    return file;
  }

  async getFilesByFolder(folderId: string): Promise<FileRecord[]> {
    return db.select().from(files).where(eq(files.folderId, folderId));
  }

  async getFile(id: string): Promise<FileRecord | undefined> {
    const [file] = await db.select().from(files).where(eq(files.id, id));
    return file;
  }

  async deleteFile(id: string): Promise<void> {
    await db.delete(files).where(eq(files.id, id));
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
}

export const storage = new DatabaseStorage();
