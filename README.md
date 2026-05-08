# Student Bug Tracker

A full-stack project management and bug tracking platform built for student teams, hackathons, and open-source projects. Features role-based access control, real-time collaboration, Kanban board, AI-powered bug analysis, and full deployment on Render.

**Live Demo:** https://bug-tracker-ui-evqv.onrender.com  
**Backend API:** https://bug-tracker-api-d117.onrender.com/api/v1/health  
**Database:** Supabase PostgreSQL (db.earwybppkswgemvjyjau.supabase.co)

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Features](#features)
4. [Architecture](#architecture)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Role-Based Access Control](#role-based-access-control)
8. [Project Structure](#project-structure)
9. [Local Development Setup](#local-development-setup)
10. [Deployment](#deployment)
11. [Environment Variables](#environment-variables)
12. [Demo Accounts](#demo-accounts)

---

## Project Overview

Student Bug Tracker is a collaborative platform where student teams can:

- Create and manage software projects
- Track bugs with severity levels and status workflows
- Manage tasks on a drag-and-drop Kanban board
- Collaborate in real-time with Socket.io
- Receive in-app and email notifications
- Analyze productivity with charts and activity logs
- Plan sprints and link GitHub issues/PRs

---

## Tech Stack

### Frontend
| Tool | Version | Purpose |
|---|---|---|
| Next.js | 16.2.4 | React framework with static export |
| React | 18.3.1 | UI library |
| TypeScript | 5.9.3 | Type safety |
| Tailwind CSS | 3.4.3 | Utility-first styling |
| Zustand | 4.5.2 | Global state management |
| Axios | 1.15.0 | HTTP client |
| Socket.io-client | 4.7.5 | Real-time communication |
| Recharts | 2.12.7 | Analytics charts |
| Radix UI | various | Accessible UI components |
| Lucide React | 0.378.0 | Icon library |

### Backend
| Tool | Version | Purpose |
|---|---|---|
| Node.js | 20.x | Runtime |
| Express | 4.18.3 | HTTP server framework |
| TypeScript | 5.4.2 | Type safety |
| Prisma | 5.10.2 | ORM and database migrations |
| Socket.io | 4.7.4 | Real-time WebSocket server |
| bcryptjs | 2.4.3 | Password hashing |
| jsonwebtoken | 9.0.2 | JWT authentication |
| Nodemailer | 8.0.5 | Email notifications |
| Winston | 3.12.0 | Logging |
| Helmet | 7.1.0 | Security headers |
| express-rate-limit | 7.2.0 | API rate limiting |
| ioredis | 5.3.2 | Redis client (optional cache) |

### Database & Infrastructure
| Tool | Purpose |
|---|---|
| PostgreSQL 16 | Primary database |
| Render | Cloud hosting (backend + frontend + database) |
| Redis (optional) | Caching layer (falls back to in-memory) |

---

## Features

### Authentication
- JWT-based authentication with 7-day token expiry
- Role selection at registration (Project Lead / Team Member / QA Analyst)
- Secure password hashing with bcrypt (10 rounds)
- Auto-seed demo accounts on server startup

### Project Management
- Create projects with auto-generated UUID invite codes
- Join projects via invite code
- Project member management with role assignments
- Project switcher in sidebar

### Bug Tracking
- Report bugs with title, description, steps to reproduce, severity, and screenshot
- Severity levels: Minor / Major / Critical
- Status workflow: Open → In Progress → Resolved → Closed
- Filter bugs by severity, status, and search query
- AI-powered severity analysis using keyword detection
- Comment thread on each bug with real-time updates
- Email notifications when bugs are assigned or resolved

### Kanban Board
- Five columns: Backlog / To Do / In Progress / Testing / Done
- Drag-and-drop task cards
- Task priority: Low / Medium / High / Critical
- Due date tracking with overdue indicators
- Assignee avatars on cards
- Real-time sync — moving a card updates all connected users instantly

### Analytics Dashboard
- Task completion rate and bug fix rate
- 7-day productivity area chart
- Bug severity pie chart
- Tasks vs bugs daily bar chart
- Upcoming deadlines widget
- Success metrics (tasks done this week, bugs fixed, overdue count)

### Real-time Collaboration
- Socket.io WebSocket connection per user session
- Personal notification room (`user:<id>`)
- Project room (`project:<id>`) for shared updates
- Task moves broadcast to all project members
- New bug reports broadcast to project room
- Notifications pushed instantly without polling

### Notifications
- In-app notification bell with unread count badge
- Types: Task Assigned, Bug Assigned, Bug Resolved, Deadline Reminder, Project Invite
- Mark individual or all notifications as read
- Email notifications via SMTP (Gmail supported)
- Hourly deadline reminder job (checks tasks due in next 48 hours)

### Sprint Planning
- Create sprints with name, goal, start/end dates
- Assign tasks to sprints
- Sprint status: Planned / Active / Completed

### GitHub Integration
- Link GitHub issues or PRs to tasks and bugs
- Store repository URL per project

### Time Tracking
- Start/stop timer per task or bug
- Log manual time entries
- View time per task, bug, user, and project

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Browser                          │
│  Next.js Static Site (React + Zustand + Socket.io)  │
│  https://bug-tracker-ui-evqv.onrender.com           │
└──────────────────┬──────────────────────────────────┘
                   │ HTTPS REST + WebSocket
┌──────────────────▼──────────────────────────────────┐
│              Express API Server                     │
│  Node.js + TypeScript + Socket.io                   │
│  https://bug-tracker-api-d117.onrender.com          │
└──────────────────┬──────────────────────────────────┘
                   │ Prisma ORM
┌──────────────────▼──────────────────────────────────┐
│           PostgreSQL Database                       │
│  Render managed PostgreSQL (bug-tracker-db)         │
└─────────────────────────────────────────────────────┘
```

### Request Flow
1. User opens the frontend static site
2. Frontend reads JWT from `localStorage` and attaches it to every API request
3. Backend validates JWT, queries PostgreSQL via Prisma
4. In-memory cache (30s TTL) serves repeated reads without hitting the DB
5. Mutations invalidate the relevant cache keys
6. Socket.io broadcasts mutations to all connected project members in real-time

---

## Database Schema

### Tables

| Table | Description |
|---|---|
| `users` | User accounts with role, skills, hashed password |
| `projects` | Projects with invite code and owner |
| `project_members` | Many-to-many: users ↔ projects with role |
| `tasks` | Kanban tasks with status, priority, assignee, due date |
| `bugs` | Bug reports with severity, status, reporter, assignee |
| `comments` | Comments on bugs and tasks |
| `activity_logs` | Audit trail of all actions per project |
| `notifications` | Per-user in-app notifications |
| `sprints` | Sprint planning with task ID arrays |
| `github_links` | GitHub issue/PR links per project item |

### Enums

```
Role:         PROJECT LEAD | TEAM MEMBER | QA ANALYST
TaskStatus:   BACKLOG | TODO | IN_PROGRESS | TESTING | DONE
Priority:     LOW | MEDIUM | HIGH | CRITICAL
Severity:     MINOR | MAJOR | CRITICAL
BugStatus:    OPEN | IN_PROGRESS | RESOLVED | CLOSED
SprintStatus: PLANNED | ACTIVE | COMPLETED
```

### Performance Indexes

All hot query paths are indexed:
- `bugs(projectId)`, `bugs(projectId, status)`, `bugs(projectId, severity)`
- `tasks(projectId)`, `tasks(projectId, status)`, `tasks(assigneeId)`
- `notifications(userId, read)`, `notifications(userId, createdAt DESC)`
- `activity_logs(projectId, createdAt DESC)`
- `comments(bugId, createdAt)`, `comments(taskId, createdAt)`

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login, returns JWT |
| GET | `/api/v1/auth/me` | Get current user |
| PATCH | `/api/v1/auth/profile` | Update name/skills |
| PATCH | `/api/v1/auth/password` | Change password |

### Projects
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/projects` | List user's projects |
| POST | `/api/v1/projects` | Create project |
| POST | `/api/v1/projects/join` | Join via invite code |

### Tasks
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/projects/:id/tasks` | List project tasks |
| POST | `/api/v1/projects/:id/tasks` | Create task |
| PATCH | `/api/v1/tasks/:id` | Update task |
| DELETE | `/api/v1/tasks/:id` | Delete task |

### Bugs
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/projects/:id/bugs` | List project bugs |
| POST | `/api/v1/projects/:id/bugs` | Report bug |
| PATCH | `/api/v1/bugs/:id` | Update bug |

### Comments
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/bugs/:id/comments` | Get bug comments |
| POST | `/api/v1/bugs/:id/comments` | Add comment |

### Notifications
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/notifications` | Get user notifications |
| PATCH | `/api/v1/notifications/:id/read` | Mark as read |
| PATCH | `/api/v1/notifications/read-all` | Mark all as read |

### Analytics & Activity
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/projects/:id/analytics` | Project analytics |
| GET | `/api/v1/projects/:id/activities` | Activity log |

### Sprints
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/projects/:id/sprints` | List sprints |
| POST | `/api/v1/projects/:id/sprints` | Create sprint |
| PATCH | `/api/v1/sprints/:id` | Update sprint |
| DELETE | `/api/v1/sprints/:id` | Delete sprint |

### GitHub
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/projects/:id/github-links` | Get all links |
| PUT | `/api/v1/projects/:id/github-links/:itemId` | Upsert link |
| DELETE | `/api/v1/projects/:id/github-links/:itemId` | Remove link |
| GET | `/api/v1/projects/:id/github-repo` | Get repo URL |
| PUT | `/api/v1/projects/:id/github-repo` | Set repo URL |

### AI
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/ai/analyze-bug` | AI severity analysis |

### Health
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/health` | Server + DB health check |

---

## Role-Based Access Control

| Feature | Project Lead | Team Member | QA Analyst |
|---|---|---|---|
| Create project | ✅ | ❌ | ❌ |
| Join project | ✅ | ✅ | ✅ |
| View invite code | ✅ | ❌ | ❌ |
| Kanban board | ✅ | ✅ | ❌ |
| Create/edit tasks | ✅ | ✅ | ❌ |
| Delete tasks | ✅ | ❌ | ❌ |
| Report bugs | ✅ | ✅ | ✅ |
| Change bug status | ✅ | ✅ | ❌ |
| Delete bugs | ✅ | ❌ | ❌ |
| View analytics | ✅ | ✅ | ✅ |
| Sprint planning | ✅ | ✅ | ❌ |
| GitHub integration | ✅ | ✅ | ❌ |

---

## Project Structure

```
student-bug-tracker/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema + indexes
│   │   ├── migrations/            # SQL migration history
│   │   └── seed-simple.ts         # Demo data seeder
│   ├── src/
│   │   ├── index.ts               # All routes + Socket.io (main file)
│   │   ├── server.ts              # Entry point + keep-alive ping
│   │   ├── app.ts                 # Express app config
│   │   ├── controllers/           # Route handler functions
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts # JWT verification
│   │   │   ├── errorHandler.ts    # Global error handler
│   │   │   └── validate.ts        # Request validation
│   │   ├── lib/
│   │   │   ├── prisma.ts          # Prisma client singleton
│   │   │   ├── redis.ts           # Optional Redis cache
│   │   │   ├── email.ts           # Nodemailer email sender
│   │   │   ├── jwt.ts             # JWT helpers
│   │   │   └── logger.ts          # Winston logger
│   │   ├── routes/                # Express router files
│   │   ├── socket/                # Socket.io event handlers
│   │   └── types/                 # TypeScript type definitions
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx         # Root layout
│   │   │   ├── page.tsx           # Root redirect
│   │   │   ├── login/             # Login page
│   │   │   ├── register/          # Registration page
│   │   │   └── dashboard/
│   │   │       ├── layout.tsx     # Dashboard sidebar + nav
│   │   │       ├── page.tsx       # Overview with charts
│   │   │       ├── kanban/        # Drag-and-drop board
│   │   │       ├── bugs/          # Bug reports + comments
│   │   │       ├── projects/      # Project management
│   │   │       ├── analytics/     # Analytics charts
│   │   │       ├── activity/      # Activity log
│   │   │       ├── notifications/ # Notification center
│   │   │       ├── sprints/       # Sprint planning
│   │   │       ├── github/        # GitHub integration
│   │   │       ├── settings/      # User settings
│   │   │       └── time-tracking/ # Time tracker
│   │   ├── components/
│   │   │   ├── ui/                # Radix UI base components
│   │   │   ├── ProtectedRoute.tsx # Auth guard
│   │   │   ├── RoleGuard.tsx      # Role-based guard
│   │   │   └── DeadlineAlert.tsx  # Deadline toast
│   │   └── lib/
│   │       ├── api.ts             # Axios instance + cached GET
│   │       ├── store-api.ts       # Zustand store (API-backed)
│   │       ├── socket.ts          # Socket.io client
│   │       ├── rbac.ts            # Role permissions
│   │       └── types.ts           # TypeScript types
│   ├── next.config.mjs            # Static export config
│   ├── tailwind.config.ts
│   └── package.json
│
├── render.yaml                    # Render deployment blueprint
└── README.md
```

---

## Local Development Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 16
- Git

### 1. Clone the repo
```bash
git clone https://github.com/kutikantiyashwanth/bug_tracker.git
cd bug_tracker/student-bug-tracker
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create `.env` file:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/student_bug_tracker"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
REDIS_URL=""
```

Run migrations and start:
```bash
npx prisma migrate deploy
npx prisma generate
npm run dev
```

### 3. Frontend setup
```bash
cd ../frontend
npm install
```

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

Start:
```bash
npm run dev
```

Open http://localhost:3000

---

## Deployment

Deployed on **Render** using `render.yaml` blueprint.

| Service | Type | URL |
|---|---|---|
| `bug-tracker-api` | Web Service (Node) | https://bug-tracker-api-d117.onrender.com |
| `bug-tracker-ui` | Static Site | https://bug-tracker-ui-evqv.onrender.com |
| `bug-tracker-db` | PostgreSQL (Free) | Internal to Render |

### Backend build command
```
npm install && npx prisma generate && npx prisma migrate deploy
```

### Frontend build command
```
npm install && npm run build
```
Publish directory: `out`

### Keep-alive
The backend pings its own `/api/v1/health` endpoint every 14 minutes to prevent Render free tier from sleeping.

---

## Environment Variables

### Backend
| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | ✅ | Token expiry (e.g. `7d`) |
| `PORT` | ✅ | Server port (10000 on Render) |
| `NODE_ENV` | ✅ | `production` or `development` |
| `FRONTEND_URL` | ✅ | Frontend URL for CORS |
| `RENDER_EXTERNAL_URL` | ⚡ | Backend URL for keep-alive ping |
| `REDIS_URL` | ❌ | Optional Redis URL |
| `SMTP_HOST` | ❌ | Email SMTP host |
| `SMTP_PORT` | ❌ | Email SMTP port |
| `SMTP_USER` | ❌ | Email address |
| `SMTP_PASS` | ❌ | Email app password |

### Frontend
| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ | Backend API base URL |
| `NEXT_PUBLIC_SOCKET_URL` | ✅ | Backend Socket.io URL |

---

## Demo Accounts

| Email | Password | Role |
|---|---|---|
| admin@test.com | password123 | Project Lead |
| dev@test.com | password123 | Team Member |
| tester@test.com | password123 | QA Analyst |
