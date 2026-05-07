# Quick Start

## Option 1 — Use the Live Website
https://bug-tracker-ui-evqv.onrender.com

Login: admin@test.com / password123

## Option 2 — Run Locally

### Prerequisites
- Node.js 20+
- PostgreSQL 16

### Backend
```bash
cd backend
npm install
# Set DATABASE_URL in .env
npx prisma migrate deploy
npx prisma generate
npm run dev
```

### Frontend
```bash
cd frontend
npm install
# Set NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1 in .env.local
npm run dev
```

Open http://localhost:3000
