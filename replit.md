# WorkVault - Workspace Media Manager

## Overview
A workspace application where admins can create workspaces, add team members, create folder structures, and upload/organize images and videos.

## Architecture
- **Frontend**: React + TypeScript with Vite, TanStack Query, wouter routing, shadcn/ui
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM + DynamoDB (AIFORVIZAG_file_structure table for folder/file metadata)
- **Auth**: Email/password with bcrypt + express-session (stored in PostgreSQL)
- **File Storage**: AWS S3 (bucket: aiforvizag21022026-workvault) + CloudFront CDN (d645yzu9m78ar.cloudfront.net)
- **Legacy File Storage**: Replit Object Storage (still available for existing workspace files)

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
- `shared/schema.ts` - All Drizzle models (organisations, workspaces, members, folders, files) + re-exports auth models
- `shared/models/auth.ts` - Auth-related models (users, sessions)
- `server/routes.ts` - All API endpoints with auth middleware
- `server/storage.ts` - DatabaseStorage class implementing IStorage interface
- `server/db.ts` - Database connection
- `server/aws/config.ts` - AWS SDK clients (S3, CloudFront, DynamoDB) and constants
- `server/aws/setup.ts` - Auto-creates S3 bucket, CloudFront distribution, DynamoDB table on startup
- `server/aws/fileService.ts` - S3 upload (presigned URLs), DynamoDB CRUD for file/folder metadata
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
- `GET/POST /api/workspaces` - List/create workspaces
- `GET/DELETE /api/workspaces/:id` - Get/delete workspace
- `GET/POST /api/workspaces/:id/members` - List/add members
- `DELETE /api/workspaces/:wsId/members/:memberId` - Remove member
- `GET/POST /api/workspaces/:id/folders` - List/create folders
- `DELETE /api/workspaces/:wsId/folders/:folderId` - Delete folder
- `GET /api/workspaces/:wsId/folders/:folderId/files` - List files in folder
- `POST /api/workspaces/:id/files` - Create file record
- `DELETE /api/workspaces/:wsId/files/:fileId` - Delete file
- `POST /api/uploads/request-url` - Get presigned upload URL
- `GET/POST /api/organisations` - List/create organisations
- `GET /api/organisations/:orgId` - Get organisation
- `POST /api/aws/upload-url` - Get presigned S3 upload URL (orgId/filename)
- `POST /api/aws/files` - Save file metadata to DynamoDB
- `GET /api/aws/orgs/:orgId/files` - Get all files for an org
- `GET /api/aws/orgs/:orgId/folders/:folderId/files` - Get files in folder
- `POST /api/aws/folders` - Create folder in DynamoDB
- `GET /api/aws/orgs/:orgId/folders` - Get all folders for an org
- `DELETE /api/aws/orgs/:orgId/files/:folderId/:fileId` - Delete file from S3 + DynamoDB
- `DELETE /api/aws/orgs/:orgId/folders/:folderId` - Delete folder + its files

## Running
- `npm run dev` starts both frontend and backend on port 5000
- `npm run db:push` pushes schema changes to database
