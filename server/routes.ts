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
  getInterrogationsByWorkspace,
  createTask,
  getTasksByWorkspace,
  updateTask,
  deleteTask,
  createTaskComment,
  getTaskComments,
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

      let data: any = null;
      let lastError = "";
      const MAX_RETRIES = 3;
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), attempt === 1 ? 30000 : 45000);
          const response = await fetch(summaryApiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: controller.signal,
          });
          clearTimeout(timeout);

          if (!response.ok) {
            lastError = await response.text();
            console.error(`Summary API attempt ${attempt}/${MAX_RETRIES} failed:`, response.status, lastError);
            if (attempt < MAX_RETRIES) {
              await new Promise(r => setTimeout(r, 2000 * attempt));
              continue;
            }
            return res.status(502).json({ error: `The summary service is temporarily unavailable. Please try again.` });
          }

          data = await response.json();
          break;
        } catch (fetchErr: any) {
          lastError = fetchErr.message || "Request failed";
          console.error(`Summary API attempt ${attempt}/${MAX_RETRIES} error:`, lastError);
          if (attempt < MAX_RETRIES) {
            await new Promise(r => setTimeout(r, 2000 * attempt));
            continue;
          }
          return res.status(502).json({ error: `The summary service is temporarily unavailable. Please try again.` });
        }
      }

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

  const BRIEFING_SYSTEM_PROMPT = `You are a concise video editing briefing assistant. Your job is to quickly gather ONLY the missing details needed for a video editing brief.

IMPORTANT: Read the summary of uploaded materials carefully. Extract everything you can from it. NEVER re-ask what's already clear from the summary or from briefingAnswers. If the summary covers a layer, confirm it in one sentence and move on immediately.

The creator can also attach files/folders from their workspace to any answer. When they do, the attached file paths will appear as "[Attached: path/to/file]" in their message. Acknowledge attached files naturally.

There are 4 layers. Ask ONE question per layer. Combine sub-topics into a single question where possible.

LAYER 1 — GOAL & AUDIENCE
What's the video's purpose and who's it for?
Options: Grow followers / Sell / Build authority / Go viral / Educate / Entertain
(Audience and CTA can be inferred or asked as a quick follow-up only if unclear)

LAYER 2 — STYLE & HOOK
What vibe and opening style?
Vibe options: Bold & punchy / Clean & educational / High-energy / Storytelling / Chaotic & expressive / Custom
Hook options: Bold statement / Question / Controversy / Emotional / Statistic / Fast montage

LAYER 3 — EDITING & VISUALS
How should it be edited?
Pace: Fast cuts / Medium / Slow cinematic
Captions: Big bold / Minimal / Word-by-word / None
(Only ask about transitions and B-roll if not obvious from the vibe choice)

LAYER 4 — AUDIO & FORMAT
Music and final specs?
Music: Energetic / Emotional / Corporate / Trap / Lofi / None
Duration: Under 20s / 20-30s / 30-45s / 60s
Platform: Reels / Shorts / TikTok / Multi-platform

RULES:
1. Extract and acknowledge info from the summary FIRST. Skip layers already covered.
2. Ask only ONE question at a time. Keep messages short (2-3 sentences max).
3. If a layer is covered by summary + answers, confirm briefly and jump to the next.
4. After all 4 layers done, set isComplete=true and give a brief final summary.
5. Check briefingAnswers — never re-ask answered questions.
6. Respond ONLY in this JSON format:
{
  "message": "Short message to the creator",
  "currentLayer": 1,
  "options": [{"id": "opt1", "label": "Label", "value": "value"}],
  "multiSelect": false,
  "fieldKey": "goal",
  "isComplete": false
}`;

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

  // === List Interrogations for a workspace ===

  app.get("/api/workspaces/:id/interrogations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const orgId = await getOrCreateDefaultOrg(userId);
      const wsId = req.params.id;
      const interrogations = await getInterrogationsByWorkspace(orgId, wsId);
      const sorted = interrogations.sort((a: any, b: any) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      res.json(sorted);
    } catch (error: any) {
      console.error("Error listing interrogations:", error);
      res.status(500).json({ error: error.message || "Failed to list interrogations" });
    }
  });

  // === Generate Final Document ===

  app.post("/api/interrogator/generate-final", isAuthenticated, async (req: any, res) => {
    try {
      const { summary, briefingAnswers, fileAttachments, chatHistory, interrogationId, workspaceId } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API key not configured" });
      }

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      let answersBlock = "";
      if (briefingAnswers && Object.keys(briefingAnswers).length > 0) {
        answersBlock = Object.entries(briefingAnswers).map(([key, val]) => {
          const label = key.replace(/([A-Z])/g, " $1").trim();
          const value = Array.isArray(val) ? val.join(", ") : String(val);
          const attachments = fileAttachments?.[key];
          let attachStr = "";
          if (attachments && attachments.length > 0) {
            attachStr = "\n  Referenced files: " + attachments.map((f: any) => `${f.folderName ? f.folderName + "/" : ""}${f.name} (${f.url})`).join(", ");
          }
          return `- ${label}: ${value}${attachStr}`;
        }).join("\n");
      }

      let otherAttachments = "";
      if (fileAttachments) {
        const orphanEntries = Object.entries(fileAttachments).filter(([k]) => !briefingAnswers?.[k]);
        if (orphanEntries.length > 0) {
          const files = orphanEntries.flatMap(([, files]) => files as any[]);
          if (files.length > 0) {
            otherAttachments = "\nAdditional referenced files:\n" + files.map((f: any) => `- ${f.folderName ? f.folderName + "/" : ""}${f.name} (${f.url})`).join("\n");
          }
        }
      }

      let chatTranscript = "";
      if (chatHistory && Array.isArray(chatHistory) && chatHistory.length > 0) {
        chatTranscript = chatHistory.map((msg: any) => {
          const role = msg.role === "user" ? "Creator" : "AI";
          return `${role}: ${msg.text}`;
        }).join("\n");
      }

      const prompt = `You are a production-ready video editing brief generator. Your job is to produce a clear, concise, actionable final brief that a video editor can follow exactly.

INPUT DATA:
1. Initial analysis summary from uploaded materials:
${summary || "No summary available."}

2. Briefing answers (structured selections):
${answersBlock || "No briefing answers."}
${otherAttachments}

3. Full conversation transcript between the creator and AI assistant:
${chatTranscript || "No conversation history."}

IMPORTANT: The conversation transcript contains the creator's EXACT words and preferences. Pay close attention to every detail the creator mentioned — especially specific requests about audio, music, visuals, files, or style that may not appear in the structured answers above. The creator's free-text messages carry HIGH WEIGHT and must be reflected in the final document.

INSTRUCTIONS:
- Combine ALL three input sources (analysis, structured answers, AND conversation transcript) into ONE structured final document.
- The conversation transcript is the MOST IMPORTANT source — it contains the creator's exact preferences stated in their own words. If the creator said "I want high pitch BGM" or "fast cuts" or any other preference in the chat, it MUST appear in the final brief.
- Be EXTREMELY specific and actionable. No vague language. No filler words.
- When a file was attached as a reference (shown as [Attached: path/filename] in the conversation), you MUST explicitly mention it with its file path. For example: "Use the music from this reference video (FolderName/filename.mp4)" or "Match the color grading style shown in (References/sample.png)".
- File attachments carry HIGH WEIGHT — they are the creator's explicit references. Always call them out clearly with their paths.
- If the creator mentioned specific preferences about audio, music, visuals, pacing, or any other aspect in the conversation — include those EXACT preferences in the relevant section.
- Structure the output with clear sections using markdown headers.
- Keep it brief but complete. Every line should be an actionable instruction for the editor.

OUTPUT FORMAT (use these exact sections):

## Project Overview
Brief 1-2 line summary of what this video is about and its goal.

## Target Audience & Platform
Who is this for, what platform, what duration.

## Resources & References
List ALL referenced files/attachments with their paths and what they should be used for. Be very explicit.

## Style & Tone
Visual style, vibe, energy level. Reference any attached style examples.

## Hook & Opening
How the video should start (first 3-5 seconds).

## Editing Instructions
- Pace and cut style
- Caption style
- Transitions
- B-roll guidance
- Any specific editing techniques mentioned

## Audio & Music
Music style, mood. If a music reference was attached, say exactly: "Use music/audio from [file path]".

## Final Checklist
Bullet list of key deliverables and specs.

Remember: Be direct. No fluff. Every sentence should tell the editor exactly what to do.`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      if (interrogationId && workspaceId) {
        try {
          const userId = req.userId;
          const orgId = await getOrCreateDefaultOrg(userId);
          await updateInterrogation(orgId, workspaceId, interrogationId, {
            finalDocument: responseText,
            status: "completed",
          });
        } catch (e) {
          console.error("Error saving final document to DynamoDB:", e);
        }
      }

      res.json({ finalDocument: responseText });
    } catch (error: any) {
      console.error("Error generating final document:", error);
      res.status(500).json({ error: error.message || "Failed to generate final document" });
    }
  });

  // === Save Final Document (manual save after editing) ===

  app.post("/api/interrogator/save-final", isAuthenticated, async (req: any, res) => {
    try {
      const { interrogationId, workspaceId, finalDocument } = req.body;
      if (!interrogationId || !workspaceId || !finalDocument) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const userId = req.userId;
      const orgId = await getOrCreateDefaultOrg(userId);
      await updateInterrogation(orgId, workspaceId, interrogationId, {
        finalDocument,
        status: "completed",
      });
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error saving final document:", error);
      res.status(500).json({ error: error.message || "Failed to save final document" });
    }
  });

  // === Task Routes ===

  app.get("/api/workspaces/:id/tasks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const orgId = await getOrCreateDefaultOrg(userId);
      const wsId = req.params.id;
      const tasks = await getTasksByWorkspace(orgId, wsId);
      const sorted = tasks.sort((a: any, b: any) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB;
      });
      res.json(sorted);
    } catch (error: any) {
      console.error("Error listing tasks:", error);
      res.status(500).json({ error: error.message || "Failed to list tasks" });
    }
  });

  app.post("/api/workspaces/:id/tasks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const orgId = await getOrCreateDefaultOrg(userId);
      const wsId = req.params.id;
      const { title, description, status, priority, sourceInterrogationId } = req.body;
      if (!title) return res.status(400).json({ error: "Title is required" });
      const task = await createTask({
        orgId, workspaceId: wsId, title,
        description: description || "",
        status: status || "todo",
        priority: priority || "medium",
        sourceInterrogationId,
        createdBy: userId,
      });
      res.json(task);
    } catch (error: any) {
      console.error("Error creating task:", error);
      res.status(500).json({ error: error.message || "Failed to create task" });
    }
  });

  app.patch("/api/workspaces/:wsId/tasks/:taskId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const orgId = await getOrCreateDefaultOrg(userId);
      const { wsId, taskId } = req.params;
      const { title, description, status, priority, assignee, videoUrl } = req.body;
      const allowedStatuses = ["todo", "in_progress", "review", "done"];
      const allowedPriorities = ["high", "medium", "low"];
      const safeUpdates: Record<string, any> = {};
      if (title !== undefined) safeUpdates.title = String(title);
      if (description !== undefined) safeUpdates.description = String(description);
      if (status !== undefined && allowedStatuses.includes(status)) safeUpdates.status = status;
      if (priority !== undefined && allowedPriorities.includes(priority)) safeUpdates.priority = priority;
      if (assignee !== undefined) safeUpdates.assignee = String(assignee);
      if (videoUrl !== undefined) safeUpdates.videoUrl = String(videoUrl);
      await updateTask(orgId, wsId, taskId, safeUpdates);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error updating task:", error);
      res.status(500).json({ error: error.message || "Failed to update task" });
    }
  });

  app.delete("/api/workspaces/:wsId/tasks/:taskId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const orgId = await getOrCreateDefaultOrg(userId);
      const { wsId, taskId } = req.params;
      await deleteTask(orgId, wsId, taskId);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting task:", error);
      res.status(500).json({ error: error.message || "Failed to delete task" });
    }
  });

  // === Auto-generate tasks from Final Agenda ===

  app.post("/api/workspaces/:id/tasks/generate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const orgId = await getOrCreateDefaultOrg(userId);
      const wsId = req.params.id;
      const { interrogationId } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API key not configured" });
      }

      let finalDocument = "";
      if (interrogationId) {
        const interrogation = await getInterrogation(orgId, wsId, interrogationId);
        if (interrogation?.finalDocument) finalDocument = interrogation.finalDocument;
      }

      if (!finalDocument) {
        const interrogations = await getInterrogationsByWorkspace(orgId, wsId);
        const completed = interrogations
          .filter((i: any) => i.status === "completed" && i.finalDocument)
          .sort((a: any, b: any) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
        if (completed.length > 0) finalDocument = completed[0].finalDocument;
      }

      if (!finalDocument) {
        return res.status(400).json({ error: "No completed final agenda found. Please complete the Interrogator first." });
      }

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `You are a video production project manager. Based on the following production brief, generate a list of actionable tasks for a video editor.

PRODUCTION BRIEF:
${finalDocument}

INSTRUCTIONS:
- Break the brief into specific, actionable editing tasks
- Each task should be a single, clear action an editor can complete
- Include tasks for: editing, audio, visuals, captions, review steps
- Assign priority: "high" for critical/blocking tasks, "medium" for important, "low" for nice-to-have
- All tasks start with status "todo"
- Generate 5-15 tasks depending on complexity
- Task descriptions should be detailed enough for the editor to work independently

Return ONLY valid JSON array, no markdown, no code fences. Each object must have:
{"title": "string", "description": "string", "priority": "high|medium|low"}

Example:
[{"title":"Import raw footage","description":"Import all raw footage files into the editing timeline","priority":"high"}]`;

      const result = await model.generateContent(prompt);
      let responseText = result.response.text().trim();
      responseText = responseText.replace(/^```json?\s*/i, "").replace(/```\s*$/i, "").trim();

      let tasks: any[];
      try {
        tasks = JSON.parse(responseText);
      } catch {
        console.error("Failed to parse Gemini tasks response:", responseText);
        return res.status(500).json({ error: "AI generated invalid task data. Please try again." });
      }

      if (!Array.isArray(tasks)) {
        return res.status(500).json({ error: "AI did not return a task array. Please try again." });
      }

      const createdTasks = [];
      for (const t of tasks) {
        const task = await createTask({
          orgId, workspaceId: wsId,
          title: t.title || "Untitled Task",
          description: t.description || "",
          status: "todo",
          priority: t.priority || "medium",
          sourceInterrogationId: interrogationId || undefined,
          createdBy: userId,
        });
        createdTasks.push(task);
      }

      res.json(createdTasks);
    } catch (error: any) {
      console.error("Error generating tasks:", error);
      res.status(500).json({ error: error.message || "Failed to generate tasks" });
    }
  });

  // === Task Comments ===

  app.get("/api/workspaces/:wsId/tasks/:taskId/comments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const orgId = await getOrCreateDefaultOrg(userId);
      const { wsId, taskId } = req.params;
      const comments = await getTaskComments(orgId, wsId, taskId);
      const sorted = comments.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      res.json(sorted);
    } catch (error: any) {
      console.error("Error listing comments:", error);
      res.status(500).json({ error: error.message || "Failed to list comments" });
    }
  });

  app.post("/api/workspaces/:wsId/tasks/:taskId/comments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const orgId = await getOrCreateDefaultOrg(userId);
      const { wsId, taskId } = req.params;
      const { text, timestampSec } = req.body;
      if (!text?.trim()) return res.status(400).json({ error: "Comment text is required" });

      const user = await storage.getUserById(userId);
      const comment = await createTaskComment({
        orgId, workspaceId: wsId, taskId,
        authorId: userId,
        authorEmail: user?.email || undefined,
        text: text.trim(),
        timestampSec: timestampSec ?? undefined,
      });
      res.json(comment);
    } catch (error: any) {
      console.error("Error creating comment:", error);
      res.status(500).json({ error: error.message || "Failed to create comment" });
    }
  });

  // === AI Revision Checklist ===

  app.post("/api/workspaces/:wsId/tasks/revision-checklist", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const orgId = await getOrCreateDefaultOrg(userId);
      const wsId = req.params.wsId;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API key not configured" });
      }

      const tasks = await getTasksByWorkspace(orgId, wsId);
      const allComments: any[] = [];
      for (const task of tasks) {
        const comments = await getTaskComments(orgId, wsId, task.id);
        allComments.push(...comments.map((c: any) => ({
          taskTitle: task.title,
          taskId: task.id,
          comment: c.text,
          timestamp: c.timestampSec != null ? `${Math.floor(c.timestampSec / 60)}:${String(c.timestampSec % 60).padStart(2, "0")}` : null,
          author: c.authorEmail || "Unknown",
        })));
      }

      if (allComments.length === 0) {
        return res.status(400).json({ error: "No comments found. Add feedback comments to tasks first." });
      }

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `You are a video editing revision coordinator. Below are feedback comments from various reviewers across different tasks. Your job is to create a SINGLE, PRIORITIZED, ACTIONABLE revision checklist that an editor can follow.

FEEDBACK DATA:
${allComments.map(c => `- Task: "${c.taskTitle}" | ${c.timestamp ? `At ${c.timestamp}` : "General"} | By ${c.author}: ${c.comment}`).join("\n")}

INSTRUCTIONS:
- Consolidate overlapping or related feedback into single action items
- Prioritize: Critical fixes first, then improvements, then nice-to-haves
- Be specific and actionable — each item should be something the editor can do immediately
- Include timestamps where referenced
- Group by area (Audio, Visuals, Pacing, Captions, etc.) if it makes sense
- Use markdown formatting with headers and numbered lists

Output a clear, structured revision checklist in markdown.`;

      const result = await model.generateContent(prompt);
      const checklist = result.response.text();
      res.json({ checklist });
    } catch (error: any) {
      console.error("Error generating revision checklist:", error);
      res.status(500).json({ error: error.message || "Failed to generate revision checklist" });
    }
  });

  // === Per-Task AI Summary (summarize all timestamped comments for one task) ===

  app.post("/api/workspaces/:wsId/tasks/:taskId/summarize", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const orgId = await getOrCreateDefaultOrg(userId);
      const { wsId, taskId } = req.params;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API key not configured" });
      }

      const tasks = await getTasksByWorkspace(orgId, wsId);
      const task = tasks.find((t: any) => t.id === taskId);
      if (!task) return res.status(404).json({ error: "Task not found" });

      const comments = await getTaskComments(orgId, wsId, taskId);
      if (comments.length === 0) {
        return res.status(400).json({ error: "No comments found on this task. Add timestamped feedback first." });
      }

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const commentLines = comments.map((c: any) => {
        const ts = c.timestampSec != null ? `[${Math.floor(c.timestampSec / 60)}:${String(c.timestampSec % 60).padStart(2, "0")}]` : "[General]";
        return `${ts} ${c.authorEmail || "Reviewer"}: ${c.text}`;
      }).join("\n");

      const prompt = `You are a senior video editor's assistant. Below is a video review task and all the timestamped revision comments from reviewers.

TASK: "${task.title}"
TASK DESCRIPTION: ${task.description || "No description"}

REVIEWER COMMENTS (${comments.length} total):
${commentLines}

YOUR JOB:
Create a comprehensive, detailed revision summary for the video editor. Organize by timestamp order and:

1. **Timestamp-Ordered Revision List**: For each timestamp mentioned, explain exactly what needs to change, why, and how
2. **Priority Classification**: Mark each revision as 🔴 Critical, 🟡 Important, or 🟢 Nice-to-have
3. **Grouped Themes**: If multiple comments relate to the same area (audio, pacing, visuals, text overlays), group them
4. **Specific Action Items**: Each item should be concrete enough for the editor to execute without asking questions
5. **Overall Summary**: A 2-3 sentence overview of the revision scope

Use markdown formatting with clear headers, numbered lists, and timestamp references in bold.`;

      const result = await model.generateContent(prompt);
      const summary = result.response.text();
      res.json({ summary });
    } catch (error: any) {
      console.error("Error generating task summary:", error);
      res.status(500).json({ error: error.message || "Failed to generate summary" });
    }
  });

  // === Per-Task AI Chat (task-aware bot for editors) ===

  app.post("/api/workspaces/:wsId/tasks/:taskId/chat", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const orgId = await getOrCreateDefaultOrg(userId);
      const { wsId, taskId } = req.params;
      const { message, history } = req.body;

      if (!message?.trim()) return res.status(400).json({ error: "Message is required" });

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API key not configured" });
      }

      const tasks = await getTasksByWorkspace(orgId, wsId);
      const task = tasks.find((t: any) => t.id === taskId);
      if (!task) return res.status(404).json({ error: "Task not found" });

      const comments = await getTaskComments(orgId, wsId, taskId);

      const commentLines = comments.length > 0
        ? comments.map((c: any) => {
            const ts = c.timestampSec != null ? `[${Math.floor(c.timestampSec / 60)}:${String(c.timestampSec % 60).padStart(2, "0")}]` : "[General]";
            return `${ts} ${c.authorEmail || "Reviewer"}: ${c.text}`;
          }).join("\n")
        : "No comments yet.";

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const conversationHistory = Array.isArray(history)
        ? history.map((h: any) => `${h.role === "user" ? "Editor" : "Assistant"}: ${h.content}`).join("\n")
        : "";

      const prompt = `You are an AI assistant embedded in a video editing task management tool. You have COMPLETE knowledge of this specific task and all its reviewer feedback. Your job is to help the video editor understand what needs to be done, answer questions, provide creative suggestions, and help resolve any ambiguity in the feedback.

TASK CONTEXT:
- Title: "${task.title}"
- Description: ${task.description || "No description"}
- Status: ${task.status}
- Priority: ${task.priority}

REVIEWER COMMENTS (${comments.length} total):
${commentLines}

${conversationHistory ? `PREVIOUS CONVERSATION:\n${conversationHistory}\n` : ""}

EDITOR'S QUESTION: ${message}

INSTRUCTIONS:
- Answer specifically based on the task context and reviewer comments above
- If the editor asks about a specific timestamp, reference the relevant comment(s)
- Provide concrete, actionable recommendations
- If you're unsure about something, say so and suggest what the editor should clarify with the reviewer
- Be concise but thorough
- Use markdown formatting when helpful`;

      const result = await model.generateContent(prompt);
      const reply = result.response.text();
      res.json({ reply });
    } catch (error: any) {
      console.error("Error in task chat:", error);
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
