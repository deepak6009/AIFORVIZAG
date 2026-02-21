# The CREW - AI-Powered Creative Workspace

## Overview
CREW = Creator Resource Editor Workspace. An AI-powered creative workspace built specifically for short-form content creators and their editors. Enables workspace creation, team member management with role-based access, nested folder structures for content pipelines (Raw → Draft → Final), and media file uploads/organization. Features CRED-style bold typographic branding with the "CREW" wordmark as a visual centerpiece.

## Architecture
- **Frontend**: React + TypeScript with Vite, TanStack Query, wouter routing, shadcn/ui
- **Backend**: Express.js with TypeScript
- **Database**: DynamoDB (AIFORVIZAG_file_structure table) for ALL business data (orgs, workspaces, members, folders, files). PostgreSQL ONLY for auth (users, sessions).
- **Auth**: Email/password with bcrypt + express-session (stored in PostgreSQL)
- **File Storage**: AWS S3 (bucket: aiforvizag21022026-workvault) + CloudFront CDN
- **Legacy File Storage**: Replit Object Storage (still available for existing workspace files)

## DynamoDB Single-Table Design
Table: `AIFORVIZAG_file_structure`
- **Organisation**: pk=`ORG#<orgId>`, sk=`METADATA`
- **Workspace**: pk=`ORG#<orgId>`, sk=`WS#<workspaceId>`
- **Member**: pk=`ORG#<orgId>`, sk=`WS#<wsId>#MEMBER#<userId>`
- **Folder**: pk=`ORG#<orgId>`, sk=`WS#<wsId>#FOLDER#<folderId>`
- **File**: pk=`ORG#<orgId>`, sk=`WS#<wsId>#FOLDER#<folderId>#FILE#<fileId>`
- **Interrogation**: pk=`ORG#<orgId>`, sk=`WS#<wsId>#INTERROGATION#<id>` (stores summary, fileUrls, briefingAnswers, status)
- **Task**: pk=`ORG#<orgId>`, sk=`WS#<wsId>#TASK#<taskId>` (title, description, status, priority, sourceInterrogationId)
- **TaskComment**: pk=`ORG#<orgId>`, sk=`WS#<wsId>#TASK#<taskId>#COMMENT#<commentId>` (text, timestampSec, authorId)
- GSIs: `orgId-index` (orgId → sk), `createdBy-index` (createdBy)
- Each user gets a default org auto-created on first workspace creation

## Branding
- Project name: "thecrew" (lowercase, one word)
- Acronym: Creator Editor Workspace (Cr-E-W)
- Logo: Typography-only wordmark — "the" (font-light) + "crew" (font-extrabold), no separate SVG icon
- Style: Lowercase wordmark "thecrew" with weight contrast is the logo itself, tracking-[0.02em]
- Hero section: Split layout — tagline-focused text left ("Your content, finally organized.") + video right, framed for short-form creators & editors
- Navbar: glossy frosted glass scroll effect (transparent at top, nav-glass-scrolled class on scroll with backdrop-blur + saturate)
- Navbar, footer, auth page, dashboard all use pure typographic wordmark as logo
- Favicon: "cw" initials on dark rounded square
- Shared components: PageNavbar (client/src/components/page-navbar.tsx) and PageFooter (client/src/components/page-footer.tsx) used across all static pages

## Key Features
- Workspace creation and management with workspace switcher
- Team member management with role-based access (admin, member, viewer)
- Nested folder structure within workspaces
- Image and video file uploads with previews
- AI Interrogator with 3-step wizard: Upload & Analyse → Gemini AI Briefing Chat → Final Document
  - Step 1: Upload files (PDF, Word, audio, text), voice-to-text recording (browser STT), text input
  - Step 2: Gemini AI chat agent with 4-layer briefing framework (Goal & Audience, Style & Hook, Editing & Visuals, Audio & Format) with selectable chip options and file attachments
  - Step 3: Gemini-generated final production brief (combines lambda summary + briefing answers + file attachments)
- Kanban task board with drag-and-drop columns (To Do/In Progress/Review/Done), AI auto-generation from Final Agenda, task detail drawer with timestamped comments, AI revision checklist
- Task video review: upload video to task, add timestamped comments with clickable playback, AI summary of all comments, task-specific AI chat bot for editors
- Resources section (placeholder - shared links and references)

## UI Layout
- ClickUp-style workspace layout with top bar and horizontal nav tabs
- Top bar: WorkVault logo | Workspace switcher dropdown | User avatar + logout
- Nav tabs: Users, Folders, Interrogator, Final Agenda, Tasks, Resources
- Routes: / (workspace selection), /workspace/:id/:tab (workspace view)

## Project Structure
- `shared/schema.ts` - TypeScript interfaces for all entities (Workspace, Folder, FileRecord, WorkspaceMember, Organisation) + re-exports auth models
- `shared/models/auth.ts` - Auth-related Drizzle models (users, sessions) — only Drizzle tables in the project
- `server/routes.ts` - All API endpoints with auth middleware, uses DynamoDB fileService
- `server/storage.ts` - Minimal storage class for auth-only operations (getUserByEmail, getUserById)
- `server/db.ts` - PostgreSQL connection (auth only)
- `server/aws/config.ts` - AWS SDK clients (S3, CloudFront, DynamoDB) and constants
- `server/aws/setup.ts` - Auto-creates S3 bucket, CloudFront distribution, DynamoDB table + GSIs on startup
- `server/aws/fileService.ts` - All DynamoDB CRUD: organisations, workspaces, members, folders, files + S3 upload
- `server/replit_integrations/auth/` - Email/password auth (register, login, logout, session)
- `server/replit_integrations/object_storage/` - Object storage integration (legacy)
- `client/src/pages/auth.tsx` - Sign in / Sign up page with card UI, password visibility toggle, strength indicator
- `client/src/pages/profile.tsx` - Profile & Settings page (edit name, change password, sign out)
- `client/src/pages/workspace-layout.tsx` - Main app shell with workspace switcher + tab routing
- `client/src/components/tabs/users-tab.tsx` - Member management (functional)
- `client/src/components/tabs/folders-tab.tsx` - Folder/file management (functional)
- `client/src/components/tabs/interrogator-tab.tsx` - 3-step Interrogator wizard with Gemini AI briefing chat
- `client/src/components/tabs/final-agenda-tab.tsx` - Final Agenda listing (saved production briefs from Interrogator)
- `client/src/components/tabs/tasks-tab.tsx` - Kanban board with drag-and-drop, task detail drawer, comments, AI generation
- `client/src/components/tabs/resources-tab.tsx` - Shared resources (placeholder)

## API Routes
- `POST /api/auth/register` - Register with email/password
- `POST /api/auth/login` - Sign in with email/password
- `POST /api/auth/logout` - Sign out (destroy session)
- `GET /api/auth/user` - Get current authenticated user
- `PATCH /api/auth/user` - Update profile (firstName, lastName)
- `POST /api/auth/change-password` - Change password (requires current password)
- `GET/POST /api/workspaces` - List/create workspaces (DynamoDB)
- `GET/DELETE /api/workspaces/:id` - Get/delete workspace (DynamoDB)
- `GET/POST /api/workspaces/:id/members` - List/add members (DynamoDB)
- `DELETE /api/workspaces/:wsId/members/:memberId` - Remove member (DynamoDB)
- `GET/POST /api/workspaces/:id/folders` - List/create folders (DynamoDB)
- `DELETE /api/workspaces/:wsId/folders/:folderId` - Delete folder (DynamoDB + S3)
- `GET /api/workspaces/:wsId/folders/:folderId/files` - List files in folder (DynamoDB)
- `POST /api/workspaces/:id/files` - Create file record (DynamoDB)
- `DELETE /api/workspaces/:wsId/files/:fileId` - Delete file (DynamoDB + S3)
- `POST /api/uploads/request-url` - Get presigned upload URL (S3)
- `GET/POST /api/organisations` - List/create organisations (DynamoDB)
- `GET /api/organisations/:orgId` - Get organisation (DynamoDB)
- `POST /api/aws/upload-url` - Get presigned S3 upload URL
- `POST /api/interrogator/upload-text` - Convert text to .txt on S3
- `POST /api/interrogator/summarize` - Proxy summary lambda + store in DynamoDB
- `GET /api/workspaces/:id/interrogations` - List interrogations for a workspace (DynamoDB)
- `POST /api/interrogator/chat` - Gemini AI briefing chat with 4-layer framework
- `POST /api/interrogator/generate-final` - Gemini-powered final document generation (combines lambda summary + briefing answers + file attachments)
- `GET/POST /api/workspaces/:id/tasks` - List/create tasks (DynamoDB)
- `PATCH /api/workspaces/:wsId/tasks/:taskId` - Update task (DynamoDB)
- `DELETE /api/workspaces/:wsId/tasks/:taskId` - Delete task (DynamoDB)
- `POST /api/workspaces/:id/tasks/generate` - Auto-generate tasks from Final Agenda via Gemini AI
- `GET/POST /api/workspaces/:wsId/tasks/:taskId/comments` - List/add timestamped comments (DynamoDB)
- `POST /api/workspaces/:wsId/tasks/revision-checklist` - Gemini AI revision checklist from all task comments
- `POST /api/workspaces/:wsId/tasks/:taskId/summarize` - AI summary of all timestamped comments for one task
- `POST /api/workspaces/:wsId/tasks/:taskId/chat` - Task-aware AI chatbot for editors (knows task context + comments)

## Running
- `npm run dev` starts both frontend and backend on port 5000
- `npm run db:push` pushes auth schema changes to PostgreSQL
