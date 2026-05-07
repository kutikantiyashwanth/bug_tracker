# Complete Database Setup

## Database: PostgreSQL

### Local Setup
- Host: localhost
- Port: 5432
- User: postgres
- Password: Yashwanth
- Database: student_bug_tracker

### Production (Render)
- Managed PostgreSQL on Render
- Connected via DATABASE_URL environment variable
- Auto-migrated on every deploy

### Run Migrations
```bash
npx prisma migrate deploy
npx prisma generate
```

### Tables
- users
- projects
- project_members
- tasks
- bugs
- comments
- activity_logs
- notifications
- sprints
- github_links

### Connect Locally
```bash
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d student_bug_tracker
```
Password: Yashwanth
