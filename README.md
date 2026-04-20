# Student Bug Tracker

A lightweight project management and bug tracking platform designed for student teams and hackathons.

## Tech Stack

### Frontend
- **Next.js 14** — React framework with App Router
- **TypeScript** — Type-safe development
- **Tailwind CSS** — Utility-first styling
- **Shadcn/UI** — Accessible component library (Radix UI + Tailwind)
- **Zustand** — Lightweight state management
- **Recharts** — Charting library
- **Lucide React** — Icon library
- **Socket.io Client** — Real-time updates

### Backend
- **Node.js + Express.js** — REST API
- **PostgreSQL** — Relational database
- **Prisma ORM** — Database toolkit
- **Redis** — Caching layer
- **Socket.io** — WebSocket server
- **JWT** — Authentication

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis (optional, for caching)

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

> **Demo Mode:** The frontend works standalone with localStorage-backed mock data. Use `alex@team.dev` with any password to login.

### Backend Setup

```bash
cd backend

# Copy environment variables
cp .env.example .env
# Edit .env with your database credentials

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Start development server
npm run dev
```

The API will be available at `http://localhost:5000`.

## Features

### ✅ Authentication & User Management
- User registration and login
- Profile creation (name, role, skills)
- Join team via invite link

### ✅ Project & Team Management
- Create projects
- Invite members via invite code
- Role assignment: Admin, Developer, Tester

### ✅ Kanban Task Board
- **Columns:** Backlog → To Do → In Progress → Testing → Done
- Drag and drop cards between columns
- Assign members, set due dates, priority levels
- Priority: Low, Medium, High, Critical

### ✅ Bug Reporting System
- Title, Description, Steps to Reproduce
- Severity: Minor, Major, Critical
- Screenshot upload placeholder
- Assign developer
- Filter by status and severity

### ✅ Activity Log
- Tracks task creation, movement, bug fixes, member joining
- Timeline view grouped by date

### ✅ Notifications
- Task assignment alerts
- Deadline reminders
- Bug assignment alerts
- Project invite notifications
- In-app notification center

### ✅ Dashboard & Analytics
- Tasks completed vs pending
- Bugs open vs fixed
- Task distribution chart
- Upcoming deadlines
- Recent activity feed

## Project Structure

```
student-bug-tracker/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── login/           # Auth pages
│   │   │   ├── register/
│   │   │   └── dashboard/       # Dashboard pages
│   │   │       ├── kanban/      # Kanban board
│   │   │       ├── bugs/        # Bug reports
│   │   │       ├── activity/    # Activity log
│   │   │       ├── notifications/
│   │   │       ├── projects/
│   │   │       └── settings/
│   │   ├── components/ui/       # Shadcn UI components
│   │   └── lib/
│   │       ├── store.ts         # Zustand state management
│   │       ├── types.ts         # TypeScript types
│   │       └── utils.ts         # Utility functions
│   ├── package.json
│   ├── tailwind.config.ts
│   └── next.config.mjs
├── backend/
│   ├── prisma/schema.prisma     # Database schema
│   ├── src/index.ts             # Express server + Socket.io
│   ├── package.json
│   └── .env.example
└── README.md
```

## License

MIT

---

## 📚 Documentation

- **[Quick Start Guide](QUICK_START.md)** - Get up and running in 5 minutes
- **[Complete User Guide](USER_GUIDE.md)** - Detailed step-by-step instructions for all features
- **[Features Overview](FEATURES_OVERVIEW.md)** - Visual guide to all features and UI elements

### New User? Start Here:
1. Read the [Quick Start Guide](QUICK_START.md) (5 minutes)
2. Create your first project
3. Invite your team
4. Start tracking tasks and bugs!

### Need Help?
- Check the [User Guide](USER_GUIDE.md) for detailed instructions
- Review the [Features Overview](FEATURES_OVERVIEW.md) for visual examples
- See the project structure above for technical details
