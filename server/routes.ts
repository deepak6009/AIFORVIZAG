import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, registerAuthRoutes } from "./replit_integrations/auth";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import { insertWorkspaceSchema, insertFolderSchema, insertFileSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);
  registerObjectStorageRoutes(app);

  app.get("/api/workspaces", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const workspaces = await storage.getWorkspacesByUser(userId);
      res.json(workspaces);
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      res.status(500).json({ message: "Failed to fetch workspaces" });
    }
  });

  app.get("/api/workspaces/:id", isAuthenticated, async (req: any, res) => {
    try {
      const workspace = await storage.getWorkspace(req.params.id);
      if (!workspace) return res.status(404).json({ message: "Workspace not found" });
      const userId = req.userId;
      const member = await storage.getMemberByUserAndWorkspace(userId, workspace.id);
      if (!member) return res.status(403).json({ message: "Access denied" });
      res.json(workspace);
    } catch (error) {
      console.error("Error fetching workspace:", error);
      res.status(500).json({ message: "Failed to fetch workspace" });
    }
  });

  app.post("/api/workspaces", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const parsed = insertWorkspaceSchema.parse(req.body);
      const workspace = await storage.createWorkspace({ ...parsed, createdBy: userId });
      res.status(201).json(workspace);
    } catch (error: any) {
      console.error("Error creating workspace:", error);
      res.status(400).json({ message: error.message || "Failed to create workspace" });
    }
  });

  app.delete("/api/workspaces/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const member = await storage.getMemberByUserAndWorkspace(userId, req.params.id);
      if (!member || member.role !== "admin") return res.status(403).json({ message: "Only admins can delete workspaces" });
      await storage.deleteWorkspace(req.params.id);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting workspace:", error);
      res.status(500).json({ message: "Failed to delete workspace" });
    }
  });

  app.get("/api/workspaces/:id/members", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const member = await storage.getMemberByUserAndWorkspace(userId, req.params.id);
      if (!member) return res.status(403).json({ message: "Access denied" });
      const members = await storage.getMembers(req.params.id);
      res.json(members);
    } catch (error) {
      console.error("Error fetching members:", error);
      res.status(500).json({ message: "Failed to fetch members" });
    }
  });

  app.post("/api/workspaces/:id/members", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const adminMember = await storage.getMemberByUserAndWorkspace(userId, req.params.id);
      if (!adminMember || adminMember.role !== "admin") return res.status(403).json({ message: "Only admins can add members" });

      const { email, role } = req.body;
      if (!email) return res.status(400).json({ message: "Email is required" });

      const targetUser = await storage.getUserByEmail(email);
      if (!targetUser) return res.status(404).json({ message: "User not found. They need to sign in first." });

      const existing = await storage.getMemberByUserAndWorkspace(targetUser.id, req.params.id);
      if (existing) return res.status(400).json({ message: "User is already a member" });

      const member = await storage.addMember({
        workspaceId: req.params.id,
        userId: targetUser.id,
        role: role || "member",
      });
      res.status(201).json(member);
    } catch (error: any) {
      console.error("Error adding member:", error);
      res.status(400).json({ message: error.message || "Failed to add member" });
    }
  });

  app.delete("/api/workspaces/:workspaceId/members/:memberId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const adminMember = await storage.getMemberByUserAndWorkspace(userId, req.params.workspaceId);
      if (!adminMember || adminMember.role !== "admin") return res.status(403).json({ message: "Only admins can remove members" });
      await storage.removeMember(req.params.memberId);
      res.status(204).end();
    } catch (error) {
      console.error("Error removing member:", error);
      res.status(500).json({ message: "Failed to remove member" });
    }
  });

  app.get("/api/workspaces/:id/folders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const member = await storage.getMemberByUserAndWorkspace(userId, req.params.id);
      if (!member) return res.status(403).json({ message: "Access denied" });
      const foldersData = await storage.getFolders(req.params.id);
      res.json(foldersData);
    } catch (error) {
      console.error("Error fetching folders:", error);
      res.status(500).json({ message: "Failed to fetch folders" });
    }
  });

  app.post("/api/workspaces/:id/folders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const member = await storage.getMemberByUserAndWorkspace(userId, req.params.id);
      if (!member || member.role === "viewer") return res.status(403).json({ message: "Viewers cannot create folders" });

      const { name, parentId } = req.body;
      if (!name) return res.status(400).json({ message: "Name is required" });

      if (parentId) {
        const parentFolder = await storage.getFolder(parentId);
        if (!parentFolder || parentFolder.workspaceId !== req.params.id) {
          return res.status(400).json({ message: "Invalid parent folder" });
        }
      }

      const folder = await storage.createFolder({
        name,
        workspaceId: req.params.id,
        parentId: parentId || null,
        createdBy: userId,
      });
      res.status(201).json(folder);
    } catch (error: any) {
      console.error("Error creating folder:", error);
      res.status(400).json({ message: error.message || "Failed to create folder" });
    }
  });

  app.delete("/api/workspaces/:workspaceId/folders/:folderId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const member = await storage.getMemberByUserAndWorkspace(userId, req.params.workspaceId);
      if (!member || member.role === "viewer") return res.status(403).json({ message: "Viewers cannot delete folders" });
      await storage.deleteFolder(req.params.folderId);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting folder:", error);
      res.status(500).json({ message: "Failed to delete folder" });
    }
  });

  app.get("/api/workspaces/:workspaceId/folders/:folderId/files", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const member = await storage.getMemberByUserAndWorkspace(userId, req.params.workspaceId);
      if (!member) return res.status(403).json({ message: "Access denied" });
      const filesData = await storage.getFilesByFolder(req.params.folderId);
      res.json(filesData);
    } catch (error) {
      console.error("Error fetching files:", error);
      res.status(500).json({ message: "Failed to fetch files" });
    }
  });

  app.post("/api/workspaces/:id/files", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const member = await storage.getMemberByUserAndWorkspace(userId, req.params.id);
      if (!member || member.role === "viewer") return res.status(403).json({ message: "Viewers cannot upload files" });

      const { name, type, objectPath, size, folderId } = req.body;
      if (!name || !type || !objectPath || !folderId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const file = await storage.createFile({
        name,
        type,
        objectPath,
        size: size || null,
        folderId,
        workspaceId: req.params.id,
        createdBy: userId,
      });
      res.status(201).json(file);
    } catch (error: any) {
      console.error("Error creating file:", error);
      res.status(400).json({ message: error.message || "Failed to create file" });
    }
  });

  app.delete("/api/workspaces/:workspaceId/files/:fileId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const member = await storage.getMemberByUserAndWorkspace(userId, req.params.workspaceId);
      if (!member || member.role === "viewer") return res.status(403).json({ message: "Viewers cannot delete files" });
      await storage.deleteFile(req.params.fileId);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting file:", error);
      res.status(500).json({ message: "Failed to delete file" });
    }
  });

  return httpServer;
}
