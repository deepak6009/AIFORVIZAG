# The CREW - AI-Powered Creative Workspace

## Overview
CREW = Creator Resource Editor Workspace. An AI-powered creative workspace where admins can create workspaces, add team members, create folder structures, and upload/organize images and videos. Features CRED-style bold typographic branding with the "CREW" wordmark as a visual centerpiece.

## Architecture
- **Frontend**: React + TypeScript with Vite, TanStack Query, wouter routing, shadcn/ui
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Email/password with bcrypt + express-session (stored in PostgreSQL)
- **File Storage**: Replit Object Storage (Google Cloud Storage presigned URLs)

## Branding
- Project name: "thecrew" (lowercase, one word)
- Acronym: Creator Editor Workspace (Cr-E-W)
- Logo: Typography-only wordmark — "the" (font-light) + "crew" (font-extrabold), no separate SVG icon
- Style: Lowercase wordmark "thecrew" with weight contrast is the logo itself, tracking-[0.02em]
- Hero section: Centered tagline-focused hero ("Your media, finally organized.") with video below, no redundant brand repetition
- Navbar, footer, auth page, dashboard all use pure typographic wordmark as logo
- Favicon: "cw" initials on dark rounded square

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
- Top bar: CREW wordmark | Workspace switcher dropdown | User avatar + logout
- Nav tabs: Users, Folders, Interrogator, Tasks, Resources
- Landing page at / for unauthenticated visitors (hero, features, highlights, CTA)
- Routes: / (landing for guests, workspace selection for logged-in), /auth (sign in/up), /workspace/:id/:tab (workspace view)

## Design System
- Typography: SF Pro for Apple devices, Inter for all other platforms; semibold/medium weights, negative letter-spacing
- Animations: fade-in and fade-in-up on hero elements with staggered delays, cubic-bezier(0.22, 1, 0.36, 1) easing, card hover lift effects
- Light theme: #fafafa warm background, softer borders (border-gray-200/60), subtle gradients
- Navbar: animated gradient (linear-gradient with 8s animation shift)
- Hero: centered layout with tagline heading, description, CTAs, and video below

## Project Structure
- `shared/schema.ts` - All Drizzle models (workspaces, members, folders, files) + re-exports auth models
- `shared/models/auth.ts` - Auth-related models (users, sessions)
- `server/routes.ts` - All API endpoints with auth middleware
- `server/storage.ts` - DatabaseStorage class implementing IStorage interface
- `server/db.ts` - Database connection
- `server/replit_integrations/auth/` - Email/password auth (register, login, logout, session)
- `server/replit_integrations/object_storage/` - Object storage integration
- `client/src/pages/landing.tsx` - Landing page for unauthenticated visitors
- `client/src/pages/auth.tsx` - Sign in / Sign up page (supports ?mode=register)
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

## Running
- `npm run dev` starts both frontend and backend on port 5000
- `npm run db:push` pushes schema changes to database
