# WorkVault - Workspace Media Manager

## Overview
A workspace application where admins can create workspaces, add team members, create folder structures, and upload/organize images and videos.

## Architecture
- **Frontend**: React + TypeScript with Vite, TanStack Query, wouter routing, shadcn/ui
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Email/password with bcrypt + express-session (stored in PostgreSQL)
- **File Storage**: Replit Object Storage (Google Cloud Storage presigned URLs)

## Key Features
- Workspace creation and management
- Team member management with role-based access (admin, member, viewer)
- Nested folder structure within workspaces
- Image and video file uploads with previews
- File preview modal

## Project Structure
- `shared/schema.ts` - All Drizzle models (workspaces, members, folders, files) + re-exports auth models
- `shared/models/auth.ts` - Auth-related models (users, sessions)
- `server/routes.ts` - All API endpoints with auth middleware
- `server/storage.ts` - DatabaseStorage class implementing IStorage interface
- `server/db.ts` - Database connection
- `server/replit_integrations/auth/` - Email/password auth (register, login, logout, session)
- `server/replit_integrations/object_storage/` - Object storage integration
- `client/src/pages/auth.tsx` - Sign in / Sign up page for unauthenticated users
- `client/src/pages/dashboard.tsx` - Workspace listing for authenticated users
- `client/src/pages/workspace.tsx` - Workspace detail with folders, files, members

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

## Running
- `npm run dev` starts both frontend and backend on port 5000
- `npm run db:push` pushes schema changes to database
