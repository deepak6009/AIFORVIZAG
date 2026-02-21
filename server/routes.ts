import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, registerAuthRoutes } from "./replit_integrations/auth";
import {
  createOrganisation,
  getOrganisation,
  getOrganisationsByUser,
  createWorkspace,
  getWorkspace,
  getWorkspacesByUser,
  deleteWorkspace,
  addWorkspaceMember,
  getWorkspaceMembers,
  getMemberByUserAndWorkspace,
  removeWorkspaceMember,
  createFolder,
  getFoldersByWorkspace,
  getFolder,
  createFile,
  getFilesByFolder,
  deleteFile,
  deleteFolderAndFiles,
  getPresignedUploadUrl,
  getCloudfrontUrl,
  uploadTextToS3,
  createInterrogation,
  getInterrogation,
  updateInterrogation,
} from "./aws/fileService";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  async function getOrCreateDefaultOrg(userId: string): Promise<string> {
    const orgs = await getOrganisationsByUser(userId);
    if (orgs.length > 0) return orgs[0].orgId;
    const org = await createOrganisation({
      name: "Default Organisation",
      createdBy: userId,
    });
    return org.orgId;
  }

  // === Workspace Routes ===

  app.get("/api/workspaces", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const workspaces = await getWorkspacesByUser(userId);
      res.json(workspaces);
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      res.status(500).json({ message: "Failed to fetch workspaces" });
    }
  });

  app.get("/api/workspaces/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const orgId = await getOrCreateDefaultOrg(userId);
      const workspace = await getWorkspace(orgId, req.params.id);
      if (!workspace) return res.status(404).json({ message: "Workspace not found" });
      const member = await getMemberByUserAndWorkspace(orgId, req.params.id, userId);
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
      const orgId = await getOrCreateDefaultOrg(userId);
      const { name, description } = req.body;
      if (!name) return res.status(400).json({ message: "Name is required" });
      const workspace = await createWorkspace({
        orgId,
        name,
        description: description || undefined,
        createdBy: userId,
      });
      res.status(201).json(workspace);
    } catch (error: any) {
      console.error("Error creating workspace:", error);
      res.status(400).json({ message: error.message || "Failed to create workspace" });
    }
  });

  app.delete("/api/workspaces/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const orgId = await getOrCreateDefaultOrg(userId);
      const member = await getMemberByUserAndWorkspace(orgId, req.params.id, userId);
      if (!member || member.role !== "admin") return res.status(403).json({ message: "Only admins can delete workspaces" });
      await deleteWorkspace(orgId, req.params.id);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting workspace:", error);
      res.status(500).json({ message: "Failed to delete workspace" });
    }
  });

  // === Member Routes ===

  app.get("/api/workspaces/:id/members", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const orgId = await getOrCreateDefaultOrg(userId);
      const member = await getMemberByUserAndWorkspace(orgId, req.params.id, userId);
      if (!member) return res.status(403).json({ message: "Access denied" });
      const members = await getWorkspaceMembers(orgId, req.params.id);
      const membersWithUser = await Promise.all(
        members.map(async (m: any) => {
          const user = await storage.getUserById(m.userId);
          return {
            ...m,
            user: user ? { id: user.id, email: user.email } : { id: m.userId, email: "Unknown" },
          };
        })
      );
      res.json(membersWithUser);
    } catch (error) {
      console.error("Error fetching members:", error);
      res.status(500).json({ message: "Failed to fetch members" });
    }
  });

  app.post("/api/workspaces/:id/members", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const orgId = await getOrCreateDefaultOrg(userId);
      const adminMember = await getMemberByUserAndWorkspace(orgId, req.params.id, userId);
      if (!adminMember || adminMember.role !== "admin") return res.status(403).json({ message: "Only admins can add members" });

      const { email, role } = req.body;
      if (!email) return res.status(400).json({ message: "Email is required" });

      const targetUser = await storage.getUserByEmail(email);
      if (!targetUser) return res.status(404).json({ message: "User not found. They need to sign in first." });

      const existing = await getMemberByUserAndWorkspace(orgId, req.params.id, targetUser.id);
      if (existing) return res.status(400).json({ message: "User is already a member" });

      const member = await addWorkspaceMember({
        orgId,
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
      const orgId = await getOrCreateDefaultOrg(userId);
      const adminMember = await getMemberByUserAndWorkspace(orgId, req.params.workspaceId, userId);
      if (!adminMember || adminMember.role !== "admin") return res.status(403).json({ message: "Only admins can remove members" });
      const members = await getWorkspaceMembers(orgId, req.params.workspaceId);
      const target = members.find((m: any) => m.id === req.params.memberId);
      if (!target) return res.status(404).json({ message: "Member not found" });
      await removeWorkspaceMember(orgId, req.params.workspaceId, (target as any).userId);
      res.status(204).end();
    } catch (error) {
      console.error("Error removing member:", error);
      res.status(500).json({ message: "Failed to remove member" });
    }
  });

  // === Folder Routes ===

  app.get("/api/workspaces/:id/folders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const orgId = await getOrCreateDefaultOrg(userId);
      const member = await getMemberByUserAndWorkspace(orgId, req.params.id, userId);
      if (!member) return res.status(403).json({ message: "Access denied" });
      const foldersData = await getFoldersByWorkspace(orgId, req.params.id);
      res.json(foldersData);
    } catch (error) {
      console.error("Error fetching folders:", error);
      res.status(500).json({ message: "Failed to fetch folders" });
    }
  });

  app.post("/api/workspaces/:id/folders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const orgId = await getOrCreateDefaultOrg(userId);
      const member = await getMemberByUserAndWorkspace(orgId, req.params.id, userId);
      if (!member || member.role === "viewer") return res.status(403).json({ message: "Viewers cannot create folders" });

      const { name, parentId } = req.body;
      if (!name) return res.status(400).json({ message: "Name is required" });

      if (parentId) {
        const parentFolder = await getFolder(orgId, req.params.id, parentId);
        if (!parentFolder) {
          return res.status(400).json({ message: "Invalid parent folder" });
        }
      }

      const folder = await createFolder({
        orgId,
        workspaceId: req.params.id,
        name,
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
      const orgId = await getOrCreateDefaultOrg(userId);
      const member = await getMemberByUserAndWorkspace(orgId, req.params.workspaceId, userId);
      if (!member || member.role === "viewer") return res.status(403).json({ message: "Viewers cannot delete folders" });
      await deleteFolderAndFiles(orgId, req.params.workspaceId, req.params.folderId);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting folder:", error);
      res.status(500).json({ message: "Failed to delete folder" });
    }
  });

  // === File Routes ===

  app.get("/api/workspaces/:workspaceId/folders/:folderId/files", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const orgId = await getOrCreateDefaultOrg(userId);
      const member = await getMemberByUserAndWorkspace(orgId, req.params.workspaceId, userId);
      if (!member) return res.status(403).json({ message: "Access denied" });
      const filesData = await getFilesByFolder(orgId, req.params.workspaceId, req.params.folderId);
      res.json(filesData);
    } catch (error) {
      console.error("Error fetching files:", error);
      res.status(500).json({ message: "Failed to fetch files" });
    }
  });

  app.post("/api/workspaces/:id/files", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const orgId = await getOrCreateDefaultOrg(userId);
      const member = await getMemberByUserAndWorkspace(orgId, req.params.id, userId);
      if (!member || member.role === "viewer") return res.status(403).json({ message: "Viewers cannot upload files" });

      const { name, type, objectPath, size, folderId } = req.body;
      if (!name || !type || !objectPath || !folderId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const file = await createFile({
        orgId,
        workspaceId: req.params.id,
        folderId,
        name,
        type,
        objectPath,
        size: size || 0,
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
      const orgId = await getOrCreateDefaultOrg(userId);
      const member = await getMemberByUserAndWorkspace(orgId, req.params.workspaceId, userId);
      if (!member || member.role === "viewer") return res.status(403).json({ message: "Viewers cannot delete files" });
      const folders = await getFoldersByWorkspace(orgId, req.params.workspaceId);
      for (const folder of folders) {
        const files = await getFilesByFolder(orgId, req.params.workspaceId, (folder as any).id);
        const target = files.find((f: any) => f.id === req.params.fileId);
        if (target) {
          await deleteFile(orgId, req.params.workspaceId, (folder as any).id, req.params.fileId);
          return res.status(204).end();
        }
      }
      res.status(404).json({ message: "File not found" });
    } catch (error) {
      console.error("Error deleting file:", error);
      res.status(500).json({ message: "Failed to delete file" });
    }
  });

  // === Organisation Routes ===

  app.post("/api/organisations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const { name, description, logo } = req.body;
      if (!name) return res.status(400).json({ message: "Name is required" });
      const org = await createOrganisation({ name, description, logo, createdBy: userId });
      res.status(201).json(org);
    } catch (error: any) {
      console.error("Error creating organisation:", error);
      res.status(400).json({ message: error.message || "Failed to create organisation" });
    }
  });

  app.get("/api/organisations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const orgs = await getOrganisationsByUser(userId);
      res.json(orgs);
    } catch (error) {
      console.error("Error fetching organisations:", error);
      res.status(500).json({ message: "Failed to fetch organisations" });
    }
  });

  app.get("/api/organisations/:orgId", isAuthenticated, async (req: any, res) => {
    try {
      const org = await getOrganisation(req.params.orgId);
      if (!org) return res.status(404).json({ message: "Organisation not found" });
      if (org.createdBy !== req.userId) return res.status(403).json({ message: "Access denied" });
      res.json(org);
    } catch (error) {
      console.error("Error fetching organisation:", error);
      res.status(500).json({ message: "Failed to fetch organisation" });
    }
  });

  // === Interrogator Routes ===

  app.post("/api/interrogator/upload-text", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const orgId = await getOrCreateDefaultOrg(userId);
      const { text } = req.body;
      if (!text || !text.trim()) {
        return res.status(400).json({ error: "Text content is required" });
      }
      const result = await uploadTextToS3(orgId, text, "brief-notes.txt");
      res.json({ cloudfrontUrl: result.cloudfrontUrl, s3Key: result.s3Key });
    } catch (error: any) {
      console.error("Error uploading text to S3:", error);
      res.status(500).json({ error: error.message || "Failed to upload text" });
    }
  });

  app.post("/api/interrogator/summarize", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const orgId = await getOrCreateDefaultOrg(userId);
      const { files, workspaceId } = req.body;
      if (!files || !Array.isArray(files) || files.length === 0) {
        return res.status(400).json({ error: "At least one file URL is required" });
      }

      const summaryApiUrl = "https://uhqp6goc12.execute-api.ap-south-1.amazonaws.com/summary";
      const payload = { files };
      console.log("Sending to summary API:", JSON.stringify(payload));
      const response = await fetch(summaryApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Summary API error:", response.status, errorText);
        return res.status(502).json({ error: `The summary service is temporarily unavailable. Please try again.` });
      }

      const data = await response.json();

      let summaryText = "";
      if (data?.body) {
        try {
          const parsed = typeof data.body === "string" ? JSON.parse(data.body) : data.body;
          summaryText = parsed?.summary || JSON.stringify(parsed);
        } catch {
          summaryText = String(data.body);
        }
      }

      const wsId = workspaceId || "default";
      const interrogation = await createInterrogation({
        orgId,
        workspaceId: wsId,
        summary: summaryText,
        fileUrls: files.map((f: any) => f.url),
        createdBy: userId,
      });

      res.json({ ...data, interrogationId: interrogation.id });
    } catch (error: any) {
      console.error("Error calling summary API:", error);
      res.status(500).json({ error: error.message || "Failed to get summary" });
    }
  });

  // === Gemini Briefing Chat ===

  const BRIEFING_SYSTEM_PROMPT = `You are an expert video editing briefing assistant for WorkVault. Your job is to interview the creator step-by-step to fill in all missing details needed for a complete video editing brief.

You have received a summary of uploaded materials. Based on what's already covered, you must identify what's MISSING and ask about it. 

The complete brief has 6 layers. You must work through them ONE AT A TIME in order. For each layer, ask ONLY what's missing — skip questions already answered in the summary.

LAYER 1 — OUTCOME (Why this video exists)
- Primary goal: Grow followers / Sell something / Build authority / Go viral / Educate / Entertain
- Target audience: Age range, niche, skill level (beginner/intermediate/advanced)
- Desired viewer emotion: Motivated / Shocked / Inspired / Curious / Urgent
- Call to action: Follow / Comment / Buy / DM / Click link

LAYER 2 — STYLE REFERENCE
- Creator vibe match: Iman Gadzhi (bold, punchy, dark) / Ali Abdaal (clean, educational, calm) / MrBeast (fast, high-energy) / Ryan Trahan (storytelling + humor) / IShowSpeed (chaotic, expressive) / Custom
- Reference link (optional)

LAYER 3 — HOOK STRATEGY
- Hook type: Direct bold statement / Question / Controversial take / Emotional story / Statistic / Fast montage
- Text in first 2 seconds: Yes / No
- Hook feel: Calm / Aggressive / Curious / Dramatic / Funny

LAYER 4 — EDITING STYLE
- Caption style: Big bold center / Minimal lower-third / Word-by-word animation / No captions / Highlight keywords
- Editing pace: Fast (cut every 1-2 sec) / Medium / Slow cinematic
- Camera movement: Static / Punch-in zooms / Dynamic motion / Handheld feel
- Transitions: Hard cuts / Motion blur / Whip transitions / Minimal
- B-roll usage: Heavy / Minimal / Only when necessary

LAYER 5 — AUDIO & MUSIC
- Background music vibe: Energetic / Emotional / Corporate clean / Trap / Chill lofi / No music
- Music drop at hook: Yes / No
- Sound effects: Subtle / Punchy / Meme-style / None

LAYER 6 — STRUCTURE & LENGTH
- Target duration: Under 20 sec / 20-30 sec / 30-45 sec / 60 sec
- Platform: Instagram Reels / YouTube Shorts / TikTok / Multi-platform
- Platform safe-zone optimization: Yes / No

CRITICAL RULES:
1. Ask ONE layer at a time. Start with the first layer that has missing info.
2. Present options as selectable choices where possible.
3. Be conversational and brief — don't overwhelm the creator.
4. When a layer is complete, confirm it and move to the next.
5. After all 6 layers are covered, say "BRIEFING_COMPLETE" and provide a final structured summary.
6. Your responses MUST be in this JSON format:
{
  "message": "Your conversational message to the creator",
  "currentLayer": 1,
  "options": [
    {"id": "opt1", "label": "Option text", "value": "option_value"}
  ],
  "multiSelect": false,
  "fieldKey": "primaryGoal",
  "isComplete": false
}

The "options" array should contain clickable chip options when applicable. Set "multiSelect" to true if multiple selections are allowed. Set "fieldKey" to identify what this question is about. Set "isComplete" to true only when ALL 6 layers are fully covered.

When the user selects options or types a response, incorporate that into the brief and move forward.`;

  app.post("/api/interrogator/chat", isAuthenticated, async (req: any, res) => {
    try {
      const { summary, chatHistory, workspaceId, interrogationId, briefingAnswers } = req.body;
      
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API key not configured" });
      }

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const history = (chatHistory || []).map((msg: any) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      }));

      const chat = model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: `SYSTEM INSTRUCTIONS:\n${BRIEFING_SYSTEM_PROMPT}\n\nHere is the summary of the uploaded materials:\n\n${summary || "No summary available."}\n\nCurrent briefing answers collected so far: ${JSON.stringify(briefingAnswers || {})}\n\nPlease begin the briefing process. Identify what's missing and ask the first relevant question.` }],
          },
          {
            role: "model",
            parts: [{ text: '{"message": "Starting briefing analysis...", "currentLayer": 1, "options": [], "multiSelect": false, "fieldKey": "init", "isComplete": false}' }],
          },
          ...history,
        ],
      });

      const userMessage = chatHistory && chatHistory.length > 0 
        ? chatHistory[chatHistory.length - 1].text 
        : "Start the briefing";

      const result = await chat.sendMessage(userMessage);
      const responseText = result.response.text();

      let parsed;
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { message: responseText, currentLayer: 1, options: [], isComplete: false };
      } catch {
        parsed = { message: responseText, currentLayer: 1, options: [], isComplete: false };
      }

      if (interrogationId && briefingAnswers) {
        const userId = req.userId;
        const orgId = await getOrCreateDefaultOrg(userId);
        const wsId = workspaceId || "default";
        try {
          await updateInterrogation(orgId, wsId, interrogationId, {
            briefingAnswers,
            status: parsed.isComplete ? "completed" : "briefing",
          });
        } catch (e) {
          console.error("Error updating interrogation:", e);
        }
      }

      res.json(parsed);
    } catch (error: any) {
      console.error("Error in Gemini chat:", error);
      res.status(500).json({ error: error.message || "Failed to get AI response" });
    }
  });

  // === S3 Upload Route (used by folders-tab file upload) ===

  app.post("/api/uploads/request-url", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const orgId = await getOrCreateDefaultOrg(userId);
      const { name, size, contentType } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Missing required field: name" });
      }
      const result = await getPresignedUploadUrl(orgId, name, contentType || "application/octet-stream");
      res.json({
        uploadURL: result.uploadUrl,
        objectPath: result.cloudfrontUrl,
        s3Key: result.s3Key,
      });
    } catch (error: any) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ error: error.message || "Failed to generate upload URL" });
    }
  });

  app.post("/api/aws/upload-url", isAuthenticated, async (req: any, res) => {
    try {
      const { orgId, fileName, fileType } = req.body;
      if (!orgId || !fileName || !fileType) {
        return res.status(400).json({ message: "orgId, fileName, and fileType are required" });
      }
      const org = await getOrganisation(orgId);
      if (!org || org.createdBy !== req.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const result = await getPresignedUploadUrl(orgId, fileName, fileType);
      res.json(result);
    } catch (error: any) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ message: error.message || "Failed to generate upload URL" });
    }
  });

  return httpServer;
}
