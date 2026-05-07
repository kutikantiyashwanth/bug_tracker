# Database Setup Guide

## Option 1: Local PostgreSQL (Windows)

### Install PostgreSQL 16
Download from: https://www.postgresql.org/download/windows/

### Create Database
```sql
CREATE DATABASE student_bug_tracker;
```

### Set Environment Variable
In `backend/.env`:
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/student_bug_tracker"
```

### Run Migrations
```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

## Option 2: Render PostgreSQL (Production)

1. Go to Render dashboard
2. New + > PostgreSQL
3. Name: `bug-tracker-db`, Plan: Free
4. Copy the Internal Database URL
5. Set as `DATABASE_URL` in your backend web service environment variables

## Option 3: Neon.tech (Free Cloud)

1. Sign up at https://neon.tech
2. Create a new project
3. Copy the connection string
4. Set as `DATABASE_URL` in backend `.env`

## Connect via psql (Local)
```bash
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d student_bug_tracker
```
Password: Yashwanth
