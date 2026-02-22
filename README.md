# theCREW — Creator Editor Workspace

> The workspace where short-form creators and their editors upload raw clips, organize drafts, and ship final cuts — without the DM chaos.

---

## Table of Contents

- [Overview](#overview)
- [Creator Flow Walkthrough](#creator-flow-walkthrough)
  - [1. Landing Page](#1-landing-page)
  - [2. Sign In / Sign Up](#2-sign-in--sign-up)
  - [3. Create a Workspace](#3-create-a-workspace)
  - [4. Organize Content — Create Folders](#4-organize-content--create-folders)
  - [5. Folder View — Ready to Upload](#5-folder-view--ready-to-upload)
  - [6. AI Brief — Upload Materials](#6-ai-brief--upload-materials)
  - [7. AI Briefing — Guided Q&A](#7-ai-briefing--guided-qa)
  - [8. Production Brief — Final Document](#8-production-brief--final-document)
  - [9. Briefs — Saved Production Briefs](#9-briefs--saved-production-briefs)
  - [10. Tasks — Kanban Board](#10-tasks--kanban-board)
- [Architecture](#architecture)
  - [Tech Stack](#tech-stack)
  - [System Architecture Diagram](#system-architecture-diagram)
  - [Data Flow](#data-flow)
  - [Database Design](#database-design)
  - [Authentication Flow](#authentication-flow)
  - [File Storage Pipeline](#file-storage-pipeline)
- [Project Structure](#project-structure)
- [Running Locally](#running-locally)

---

## Overview

**theCREW** (Creator Resource Editor Workspace) is an AI-powered creative workspace built for short-form content creators and their editing teams. It replaces the chaos of DMs, shared drives, and scattered feedback with a single organized hub.

Creators can set up workspaces, invite editors, organize raw footage into folders, and manage their entire content pipeline from upload to final cut.

---

## Creator Flow Walkthrough

### 1. Landing Page

![Landing Page](attached_assets/image_1771732450747.png)

The landing page introduces theCREW with a clear value proposition: **"Your content, finally organized."** It's built specifically for short-form creators and editors who need to move fast without losing track of assets.

- **"Start for free"** button takes new users to sign up
- **"Sign in"** links existing users to the auth page
- Frosted glass navbar with the typographic **thecrew** wordmark (light "the" + bold "crew")

---

### 2. Sign In / Sign Up

![Sign In / Sign Up](attached_assets/image_1771732481340.png)

A clean authentication page with tabbed Sign In and Sign Up forms. The **thecrew** wordmark sits above the subtitle "CREATOR EDITOR WORKSPACE."

- **Sign In** — email and password with a visibility toggle
- **Sign Up** — creates a new account (email, password, display name)
- Passwords are hashed with bcrypt before storage
- Sessions are managed server-side with express-session stored in PostgreSQL

---

### 3. Create a Workspace

![Create Workspace](attached_assets/image_1771732525948.png)

After signing in, the creator lands on the workspace selection page. A personalized greeting and a prompt to create their first workspace.

- Each workspace represents a content project (e.g., "Insta reel", "YouTube Short")
- The creator who makes the workspace becomes its **admin**
- An organization is auto-created behind the scenes to group workspaces and members
- The workspace switcher in the top bar lets users jump between projects

---

### 4. Organize Content — Create Folders

![Create Folders](attached_assets/image_1771732597384.png)

Inside a workspace, the **Files** tab is the content hub. Creators organize their pipeline with folders like "Raw Clips", "Drafts", and "Finals."

- **Horizontal tab navigation**: Files, Team, AI Brief, Briefs, Tasks, References
- **Breadcrumb** shows current location (Root)
- **"New Folder"** button and empty-state prompt with **"Create Folder"** CTA
- Folders are stored in DynamoDB under the workspace's organization

---

### 5. Folder View — Ready to Upload

![Folders Added](attached_assets/image_1771732854629.png)

With folders created (e.g., "raw footage" and "logos"), the workspace is ready for file uploads. Clicking a folder opens it for drag-and-drop uploads to AWS S3.

- Folder cards show folder names with icons
- **"Click a folder above to view and upload files"** guides the user
- Files uploaded inside folders are stored in S3 and served via CloudFront CDN
- Supports images, videos, PDFs, audio, and other media formats

---

### 6. AI Brief — Upload Materials

![AI Brief Upload](attached_assets/image_1771733158375.png)

The **AI Brief** tab is where the magic begins. A 3-step wizard guides creators through building a production brief that their editors can actually follow.

**Step 1: Upload** — The creator provides context for the project:

- **Drag & drop files** — PDFs, Word docs, audio (.mp3, .wav, .ogg, .webm, .m4a), and text files
- **Voice to Text** — Speak directly into the mic; browser speech-to-text transcribes it into a text file
- **Text input** — Type or paste project notes, goals, and references directly
- All uploaded materials are stored in S3 and sent to an AI summarization service (AWS Lambda) for analysis
- Hit **"Analyse"** to process everything and move to the briefing step

---

### 7. AI Briefing — Guided Q&A

![AI Briefing Chat](attached_assets/image_1771733345404.png)

**Step 2: Briefing** — Gemini AI conducts a conversational interview to fill in the gaps. It uses a 4-layer briefing framework:

| Layer | What it covers |
|-------|---------------|
| **Goal & Audience** | Primary goal, target viewers, platform, duration |
| **Style & Hook** | Visual vibe, color grade, opening hook strategy |
| **Editing & Visuals** | Cut style, transitions, captions, B-roll needs |
| **Audio & Format** | Background music, sound effects, voiceover, pacing |

- Progress bar shows which layers have been covered (2/4 in the screenshot)
- **Selectable chip options** let creators answer quickly (e.g., "promotional" in one tap)
- Creators can also type custom answers or attach additional files mid-conversation
- The AI only asks about what's missing — if the uploaded materials already cover a topic, it skips ahead
- **"Generate Brief"** compiles everything into a final production document

---

### 8. Production Brief — Final Document

![Production Brief](attached_assets/image_1771733470944.png)

**Step 3: Brief** — Gemini generates a comprehensive production brief by combining:

1. The AI summary of uploaded materials (from the Lambda service)
2. All briefing answers from the conversational Q&A
3. Any file attachments shared during the chat

The final document includes structured sections:

- **Project Overview** — What the video is about and its goals
- **Target Audience & Platform** — Who it's for and format specs (e.g., Instagram Reels, 25-30 sec)
- **Resources & References** — Links to uploaded reference materials on CloudFront
- **Style & Tone** — Visual direction, color grading, pacing references
- **Hook & Opening** — Specific opening strategy for the first few seconds
- Editable with the **"Edit"** button if the creator wants to tweak anything
- Saved to DynamoDB as a completed interrogation record

---

### 9. Briefs — Saved Production Briefs

![Briefs Tab](attached_assets/image_1771733530462.png)

The **Briefs** tab is the library of all completed production briefs for a workspace. Each brief is an expandable card showing:

- **Brief title** with completion status badge ("Completed")
- **Timestamp** — when it was generated (e.g., "Feb 22, 2026 at 9:40 AM")
- **Full document** — expandable to show Project Overview, Target Audience, Style & Tone, Hook & Opening, and all other sections
- **"New Brief"** button to start a fresh AI briefing session
- Briefs serve as the single source of truth that editors reference when cutting content

---

### 10. Tasks — Kanban Board

![Tasks Kanban](attached_assets/image_1771733635384.png)

The **Tasks** tab is a full Kanban board where creators and editors manage the production workflow. Tasks can be auto-generated from a production brief or created manually.

- **Four columns**: To Do, In Progress, Review, Done — drag and drop to update status
- **"From Brief"** button — Gemini AI reads a completed production brief and auto-generates actionable editing tasks (e.g., "Import and Organize Footage", "Rough Cut Assembly", "Add Bold Center Captions")
- **"+ Create"** — manually add tasks with title, description, priority, and status
- **"AI Checklist"** — generates a revision checklist from all task comments across the board
- **Search** — filter tasks by keyword
- Each task card shows title, description preview, and priority badge (High, Medium, Low)
- Task count per column shown in the header
- Clicking a task opens a detail drawer with tabs for Details, Feedback (timestamped video comments), AI Summary, and Ask AI (task-aware chatbot)

---

## Architecture

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React + TypeScript, Vite, TanStack Query, wouter, shadcn/ui, Tailwind CSS |
| **Backend** | Express.js + TypeScript |
| **Auth Database** | PostgreSQL (Neon) — users and sessions only |
| **Business Database** | AWS DynamoDB — workspaces, members, folders, files, tasks |
| **File Storage** | AWS S3 + CloudFront CDN |
| **AI Engine** | Google Gemini 2.0 Flash |

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (React)                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │
│  │ Landing  │ │   Auth   │ │Workspace │ │  Workspace    │  │
│  │  Page    │ │  Page    │ │ Selector │ │  Layout       │  │
│  └──────────┘ └──────────┘ └──────────┘ │ ┌───────────┐ │  │
│                                         │ │Files Tab  │ │  │
│                                         │ │Team Tab   │ │  │
│                                         │ │AI Brief   │ │  │
│                                         │ │Briefs     │ │  │
│                                         │ │Tasks      │ │  │
│                                         │ │References │ │  │
│                                         │ └───────────┘ │  │
│                                         └───────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP / REST API
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Express.js Backend                        │
│                                                             │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │ Auth       │  │ Workspace    │  │ AWS Services        │ │
│  │ Routes     │  │ Routes       │  │ ┌─────────────────┐ │ │
│  │ (register, │  │ (workspaces, │  │ │ S3 Client       │ │ │
│  │  login,    │  │  folders,    │  │ │ DynamoDB Client  │ │ │
│  │  logout)   │  │  files,      │  │ │ CloudFront      │ │ │
│  └─────┬──────┘  │  members)    │  │ └─────────────────┘ │ │
│        │         └──────┬───────┘  └──────────┬──────────┘ │
└────────┼────────────────┼─────────────────────┼────────────┘
         │                │                     │
         ▼                ▼                     ▼
┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐
│  PostgreSQL  │  │   DynamoDB   │  │      AWS S3 Bucket     │
│   (Neon)     │  │  Single      │  │  aiforvizag21022026-   │
│              │  │  Table       │  │  workvault             │
│ ┌──────────┐ │  │  Design      │  │                        │
│ │  users   │ │  │              │  │  ┌──────────────────┐  │
│ │ sessions │ │  │ Orgs         │  │  │  CloudFront CDN  │  │
│ └──────────┘ │  │ Workspaces   │  │  │  (global edge    │  │
│              │  │ Members      │  │  │   delivery)      │  │
│              │  │ Folders      │  │  └──────────────────┘  │
│              │  │ Files        │  │                        │
└──────────────┘  └──────────────┘  └────────────────────────┘
```

### Data Flow

**Creator creates a workspace and adds folders:**

```
Creator signs up
    → POST /api/auth/register
    → Password hashed with bcrypt
    → User stored in PostgreSQL

Creator creates workspace
    → POST /api/workspaces
    → Auto-creates Organisation in DynamoDB (if first workspace)
    → Workspace record stored in DynamoDB: pk=ORG#<orgId>, sk=WS#<wsId>
    → Creator added as admin member

Creator creates folders
    → POST /api/workspaces/:id/folders
    → Folder stored in DynamoDB: pk=ORG#<orgId>, sk=WS#<wsId>#FOLDER#<folderId>
    → Folder appears in Files tab instantly via TanStack Query cache invalidation

Creator uploads files to folder
    → POST /api/uploads/request-url → S3 presigned URL
    → Client uploads directly to S3 (no server bottleneck)
    → File record stored in DynamoDB with CloudFront URL
    → Files served globally via CloudFront CDN
```

**AI Briefing pipeline (Interrogator):**

```
Creator opens AI Brief tab
    → Step 1: Upload files + text + voice notes
    → Files uploaded to S3 via presigned URLs
    → Text converted to .txt on S3 via POST /api/interrogator/upload-text
    → "Analyse" sends file URLs to AWS Lambda summarization service
    → Lambda returns structured summary → stored as Interrogation in DynamoDB

    → Step 2: AI Briefing chat
    → POST /api/interrogator/chat sends summary + chat history to Gemini 2.0 Flash
    → Gemini uses 4-layer framework (Goal, Style, Editing, Audio)
    → Asks only about missing information, skips what's already covered
    → Briefing answers accumulated across the conversation

    → Step 3: Generate final brief
    → POST /api/interrogator/generate-final combines:
       • Lambda summary of uploaded materials
       • All briefing answers from the chat
       • File attachments shared during conversation
    → Gemini produces structured production brief
    → Saved to DynamoDB as completed Interrogation record
```

**Task management from briefs:**

```
Creator clicks "From Brief" on Tasks tab
    → POST /api/workspaces/:id/tasks/generate
    → Sends final brief content to Gemini AI
    → Gemini breaks it into actionable editing tasks
    → Tasks auto-created in DynamoDB with title, description, priority
    → Kanban board populates instantly

Editor drags task between columns
    → PATCH /api/workspaces/:wsId/tasks/:taskId
    → Status updated in DynamoDB (todo → in-progress → review → done)

Editor adds timestamped comment on task
    → POST /api/workspaces/:wsId/tasks/:taskId/comments
    → Comment stored with timestampSec for video seeking
    → Clicking timestamp badge seeks video player to that moment

Creator requests AI summary
    → POST /api/workspaces/:wsId/tasks/:taskId/summarize
    → Gemini reads all timestamped comments and produces summary
```

### Database Design

**PostgreSQL** handles authentication only:

| Table | Fields |
|-------|--------|
| `users` | id, email, password (bcrypt), display_name |
| `sessions` | sid, sess (JSON), expire |

**DynamoDB** uses a single-table design for all business data:

| Entity | Partition Key (pk) | Sort Key (sk) |
|--------|-------------------|---------------|
| Organisation | `ORG#<orgId>` | `METADATA` |
| Workspace | `ORG#<orgId>` | `WS#<workspaceId>` |
| Member | `ORG#<orgId>` | `WS#<wsId>#MEMBER#<userId>` |
| Folder | `ORG#<orgId>` | `WS#<wsId>#FOLDER#<folderId>` |
| File | `ORG#<orgId>` | `WS#<wsId>#FOLDER#<folderId>#FILE#<fileId>` |
| Interrogation | `ORG#<orgId>` | `WS#<wsId>#INTERROGATION#<id>` |
| Task | `ORG#<orgId>` | `WS#<wsId>#TASK#<taskId>` |
| TaskComment | `ORG#<orgId>` | `WS#<wsId>#TASK#<taskId>#COMMENT#<commentId>` |

This hierarchical key structure allows efficient queries — fetching all folders in a workspace is a single DynamoDB query with a sort key prefix of `WS#<wsId>#FOLDER#`. The same pattern applies to tasks (`WS#<wsId>#TASK#`) and interrogations (`WS#<wsId>#INTERROGATION#`).

### Authentication Flow

```
┌──────────┐     POST /api/auth/register      ┌──────────────┐
│  Client  │ ──────────────────────────────▶   │   Express    │
│  (React) │     { email, password, name }     │   Backend    │
│          │                                   │              │
│          │  ◀──────────────────────────────  │  bcrypt hash │
│          │     Set-Cookie: session_id        │  → PostgreSQL│
└──────────┘                                   └──────────────┘
     │
     │  Subsequent requests include session cookie
     │  GET /api/auth/user → returns user profile
     ▼
  Authenticated routes check session
  before accessing workspace data
```

### File Storage Pipeline

```
Client                    Backend                 AWS S3
  │                         │                       │
  │  POST /api/uploads/     │                       │
  │  request-url            │                       │
  │ ───────────────────▶    │                       │
  │                         │  Generate presigned   │
  │                         │  upload URL           │
  │  ◀─────────────────     │                       │
  │  { uploadUrl, key }     │                       │
  │                         │                       │
  │  PUT (direct upload)    │                       │
  │ ────────────────────────────────────────────▶   │
  │                         │                       │
  │  POST /api/workspaces/  │                       │
  │  :id/files              │                       │
  │ ───────────────────▶    │                       │
  │                         │  Store file record    │
  │                         │  in DynamoDB          │
  │  ◀─────────────────     │                       │
  │  { cloudfrontUrl }      │                       │
  │                         │                       │
  │  GET via CloudFront CDN │                       │
  │ ◀───────────────────────────────────────────    │
```

Files are uploaded directly from the browser to S3 using presigned URLs, keeping the server lightweight. The CloudFront CDN ensures fast delivery worldwide.

### AI Pipeline

```
┌──────────────┐     Upload files      ┌──────────────┐     Summarize     ┌──────────────┐
│   Creator    │ ──────────────────▶   │   AWS S3     │ ─────────────▶   │  AWS Lambda  │
│  (Browser)   │   presigned URLs      │   Bucket     │   file URLs      │  Summary API │
└──────┬───────┘                       └──────────────┘                  └──────┬───────┘
       │                                                                        │
       │  Briefing Q&A                                              summary JSON│
       │                                                                        │
       ▼                                                                        ▼
┌──────────────┐     chat + summary    ┌──────────────┐              ┌──────────────┐
│   Express    │ ──────────────────▶   │  Gemini 2.0  │              │   DynamoDB   │
│   Backend    │                       │    Flash     │              │ Interrogation│
│              │  ◀──────────────────  │              │              │   record     │
│              │   AI responses        │  • Briefing  │              └──────────────┘
│              │                       │  • Final doc │
│              │                       │  • Tasks gen │
│              │                       │  • Summaries │
│              │                       │  • Chat bot  │
└──────────────┘                       └──────────────┘
```

Gemini AI powers five features:
1. **Briefing chat** — Guided Q&A with 4-layer framework to gather missing creative direction
2. **Final brief generation** — Combines uploaded material summaries + briefing answers into a structured production document
3. **Task auto-generation** — Reads a completed brief and creates actionable editing tasks for the Kanban board
4. **Comment summarization** — Reads all timestamped feedback comments on a task and produces an AI summary
5. **Task chatbot** — Context-aware AI assistant that knows the task details, comments, and video context

---

## Project Structure

```
├── client/
│   └── src/
│       ├── pages/
│       │   ├── auth.tsx              # Sign In / Sign Up page
│       │   ├── home.tsx              # Landing page
│       │   └── workspace-layout.tsx  # Main app shell with tabs
│       ├── components/
│       │   ├── tabs/
│       │   │   ├── folders-tab.tsx   # Files & folders management
│       │   │   ├── users-tab.tsx     # Team members management
│       │   │   ├── interrogator-tab.tsx # 3-step AI briefing wizard
│       │   │   ├── final-agenda-tab.tsx # Saved production briefs
│       │   │   ├── tasks-tab.tsx     # Kanban board + task drawer
│       │   │   ├── resources-tab.tsx # Shared resources
│       │   │   └── ...
│       │   ├── page-navbar.tsx       # Shared navigation bar
│       │   └── page-footer.tsx       # Shared footer
│       └── App.tsx                   # Route definitions
├── server/
│   ├── routes.ts                     # All API endpoints
│   ├── storage.ts                    # Auth storage (PostgreSQL)
│   ├── aws/
│   │   ├── config.ts                 # AWS SDK clients
│   │   ├── setup.ts                  # Auto-creates S3, DynamoDB, CloudFront
│   │   └── fileService.ts           # DynamoDB CRUD operations
│   └── replit_integrations/
│       └── auth/                     # Email/password auth handlers
├── shared/
│   ├── schema.ts                     # TypeScript interfaces
│   └── models/
│       └── auth.ts                   # Drizzle auth models
└── package.json
```

---

## Running Locally

```bash
npm run dev
```

This starts both the Express backend and Vite frontend on **port 5000**.

To push auth schema changes to PostgreSQL:

```bash
npm run db:push
```

---

*Built for creators who move fast and editors who keep up.*
