# Install PostgreSQL on Windows

## Download
https://www.postgresql.org/download/windows/

## Installation Steps
1. Download PostgreSQL 16 installer
2. Run the installer
3. Set password for `postgres` user (remember this!)
4. Keep default port: 5432
5. Complete installation

## Create the Database

Open Command Prompt and run:
```
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres
```

Then in psql:
```sql
CREATE DATABASE student_bug_tracker;
\q
```

## Connect to the Database
```
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d student_bug_tracker
```

## Set Environment Variable
In `backend/.env`:
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/student_bug_tracker"
```

## Run Migrations
```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

## Verify Tables Created
```sql
\dt
```
Should show 10 tables.

## This Project's Local Credentials
- User: postgres
- Password: Yashwanth
- Database: student_bug_tracker
- Port: 5432
