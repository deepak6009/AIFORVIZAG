# WorkVault - Workspace Media Manager

## Overview
A workspace application where admins can create workspaces, add team members, create folder structures, and upload/organize images and videos.

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
- GSIs: `orgId-index` (orgId → sk), `createdBy-index` (createdBy)
- Each user gets a default org auto-created on first workspace creation

## Key Features
- Workspace creation and management with workspace switcher
- Team member management with role-based access (admin, member, viewer)
- Nested folder structure within workspaces
- Image and video file uploads with previews
- AI Interrogator chat interface (placeholder - will create structured briefs)
- Kanban task board (placeholder - will auto-generate from AI brief)
- Resources section (placeholder - shared links and references)

## UI Layout
- ClickUp-style workspace layout with top bar and horizontal nav tabs
- Top bar: WorkVault logo | Workspace switcher dropdown | User avatar + logout
- Nav tabs: Users, Folders, Interrogator, Tasks, Resources
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
- `client/src/pages/auth.tsx` - Sign in / Sign up page
- `client/src/pages/workspace-layout.tsx` - Main app shell with workspace switcher + tab routing
- `client/src/components/tabs/users-tab.tsx` - Member management (functional)
- `client/src/components/tabs/folders-tab.tsx` - Folder/file management (functional)
- `client/src/components/tabs/interrogator-tab.tsx` - AI chat interface (placeholder)
- `client/src/components/tabs/tasks-tab.tsx` - Kanban board (placeholder)
- `client/src/components/tabs/resources-tab.tsx` - Shared resources (placeholder)

## API Routes
- `POST /api/auth/register` - Register with email/password
- `POST /api/auth/login` - Sign in with email/password
- `POST /api/auth/logout` - Sign out (destroy session)
- `GET /api/auth/user` - Get current authenticated user
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

## Running
- `npm run dev` starts both frontend and backend on port 5000
- `npm run db:push` pushes auth schema changes to PostgreSQL
