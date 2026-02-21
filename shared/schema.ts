import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, pgEnum, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";
import { users } from "./models/auth";

export const memberRoleEnum = pgEnum("member_role", ["admin", "member", "viewer"]);

export const workspaces = pgTable("workspaces", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workspaceMembers = pgTable("workspace_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workspaceId: varchar("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: memberRoleEnum("role").notNull().default("member"),
  addedAt: timestamp("added_at").defaultNow(),
}, (table) => [
  uniqueIndex("workspace_members_ws_user_idx").on(table.workspaceId, table.userId),
]);

export const folders = pgTable("folders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  workspaceId: varchar("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  parentId: varchar("parent_id").references((): any => folders.id, { onDelete: "cascade" }),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const files = pgTable("files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(),
  objectPath: text("object_path").notNull(),
  size: integer("size"),
  folderId: varchar("folder_id").notNull().references(() => folders.id, { onDelete: "cascade" }),
  workspaceId: varchar("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workspacesRelations = relations(workspaces, ({ many, one }) => ({
  members: many(workspaceMembers),
  folders: many(folders),
  files: many(files),
  creator: one(users, { fields: [workspaces.createdBy], references: [users.id] }),
}));

export const workspaceMembersRelations = relations(workspaceMembers, ({ one }) => ({
  workspace: one(workspaces, { fields: [workspaceMembers.workspaceId], references: [workspaces.id] }),
  user: one(users, { fields: [workspaceMembers.userId], references: [users.id] }),
}));

export const foldersRelations = relations(folders, ({ one, many }) => ({
  workspace: one(workspaces, { fields: [folders.workspaceId], references: [workspaces.id] }),
  parent: one(folders, { fields: [folders.parentId], references: [folders.id], relationName: "parentChild" }),
  children: many(folders, { relationName: "parentChild" }),
  files: many(files),
  creator: one(users, { fields: [folders.createdBy], references: [users.id] }),
}));

export const filesRelations = relations(files, ({ one }) => ({
  folder: one(folders, { fields: [files.folderId], references: [folders.id] }),
  workspace: one(workspaces, { fields: [files.workspaceId], references: [workspaces.id] }),
  creator: one(users, { fields: [files.createdBy], references: [users.id] }),
}));

export const insertWorkspaceSchema = createInsertSchema(workspaces).omit({ id: true, createdAt: true, createdBy: true });
export const insertFolderSchema = createInsertSchema(folders).omit({ id: true, createdAt: true, createdBy: true });
export const insertFileSchema = createInsertSchema(files).omit({ id: true, createdAt: true, createdBy: true });
export const insertMemberSchema = createInsertSchema(workspaceMembers).omit({ id: true, addedAt: true });

export type InsertWorkspace = z.infer<typeof insertWorkspaceSchema>;
export type Workspace = typeof workspaces.$inferSelect;
export type InsertFolder = z.infer<typeof insertFolderSchema>;
export type Folder = typeof folders.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;
export type FileRecord = typeof files.$inferSelect;
export type WorkspaceMember = typeof workspaceMembers.$inferSelect;
export type InsertMember = z.infer<typeof insertMemberSchema>;
