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

This hierarchical key structure allows efficient queries — fetching all folders in a workspace is a single DynamoDB query with a sort key prefix of `WS#<wsId>#FOLDER#`.

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
│       │   │   ├── tasks-tab.tsx     # Kanban task board
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
