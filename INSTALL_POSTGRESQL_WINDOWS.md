# 🐘 Install PostgreSQL on Windows - Step by Step

## 📥 Step 1: Download PostgreSQL

1. **Open your browser**
2. **Go to:** https://www.postgresql.org/download/windows/
3. **Click:** "Download the installer"
4. **Click:** "Windows x86-64" (for 64-bit Windows)
5. **Download:** PostgreSQL 16.x (latest version)
6. **Wait** for download to complete (~300MB)

**Direct Link:** https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

---

## 💿 Step 2: Run the Installer

1. **Find** the downloaded file (e.g., `postgresql-16.x-windows-x64.exe`)
2. **Double-click** to run
3. **Click "Yes"** if Windows asks for permission
4. **Click "Next"** on the welcome screen

---

## ⚙️ Step 3: Installation Settings

### Installation Directory
- **Default:** `C:\Program Files\PostgreSQL\16`
- **Click "Next"** (keep default)

### Select Components
- ✅ PostgreSQL Server
- ✅ pgAdmin 4 (GUI tool)
- ✅ Stack Builder
- ✅ Command Line Tools
- **Click "Next"** (keep all selected)

### Data Directory
- **Default:** `C:\Program Files\PostgreSQL\16\data`
- **Click "Next"** (keep default)

### Password
- **IMPORTANT:** Set a password you'll remember!
- **Example:** `postgres` (simple for development)
- **Type it twice** to confirm
- **Write it down!** You'll need this later
- **Click "Next"**

### Port
- **Default:** `5432`
- **Click "Next"** (keep default)

### Locale
- **Default:** [Default locale]
- **Click "Next"** (keep default)

### Summary
- **Review** your settings
- **Click "Next"** to start installation

---

## ⏳ Step 4: Wait for Installation

- Installation takes **5-10 minutes**
- Progress bar will show status
- **Don't close** the window
- **Wait** until it says "Completed"

---

## ✅ Step 5: Complete Installation

1. **Uncheck** "Stack Builder" (not needed now)
2. **Click "Finish"**
3. **PostgreSQL is now installed!** 🎉

---

## 🔧 Step 6: Verify Installation

### Open Command Prompt:

1. **Press** `Windows + R`
2. **Type:** `cmd`
3. **Press** Enter

### Check PostgreSQL:

```cmd
cd "C:\Program Files\PostgreSQL\16\bin"
psql --version
```

**Expected output:**
```
psql (PostgreSQL) 16.x
```

✅ **If you see this, PostgreSQL is installed!**

---

## 🗄️ Step 7: Create Database

### Open psql:

```cmd
cd "C:\Program Files\PostgreSQL\16\bin"
psql -U postgres
```

**Enter your password** when prompted (the one you set during installation)

### Create Database:

```sql
CREATE DATABASE student_bug_tracker;
```

**Expected output:**
```
CREATE DATABASE
```

### Verify Database:

```sql
\l
```

You should see `student_bug_tracker` in the list!

### Exit psql:

```sql
\q
```

✅ **Database created!**

---

## 📝 Step 8: Update .env File

1. **Open:** `student-bug-tracker/backend/.env`
2. **Find the line:**
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/student_bug_tracker"
   ```
3. **Replace `password` with YOUR password:**
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/student_bug_tracker"
   ```
4. **Save the file**

**Example:** If your password is `postgres`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/student_bug_tracker"
```

---

## 🚀 Step 9: Run Database Migrations

### Open Terminal in VS Code:

1. **Press** `Ctrl + `` (backtick)
2. **Or** View → Terminal

### Navigate to backend:

```bash
cd student-bug-tracker/backend
```

### Run migrations:

```bash
npx prisma migrate dev --name init
```

**Expected output:**
```
✔ Generated Prisma Client
✔ Applied migration: 20260418_init
```

### Generate Prisma Client:

```bash
npx prisma generate
```

**Expected output:**
```
✔ Generated Prisma Client
```

✅ **Database is ready!**

---

## 🎯 Step 10: Start Backend Server

```bash
npm run dev
```

**Expected output:**
```
🚀 Student Bug Tracker API
──────────────────────────
🌐 Server:    http://localhost:5000
📡 Socket.io: ws://localhost:5000
🏥 Health:    http://localhost:5000/api/v1/health
📚 Database:  PostgreSQL (Prisma)
──────────────────────────
```

✅ **Backend is running with database!**

---

## 🧪 Step 11: Test Database Connection

### Open new terminal:

```bash
curl http://localhost:5000/api/v1/health
```

**Expected output:**
```json
{
  "status": "ok",
  "timestamp": "2026-04-18T...",
  "uptime": 5.123,
  "database": "connected"
}
```

### Test Registration:

```bash
curl -X POST http://localhost:5000/api/v1/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"password123\",\"role\":\"developer\"}"
```

**Expected output:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "token": "..."
  }
}
```

✅ **Database is working!**

---

## 🎨 Step 12: Open pgAdmin (Optional)

### Launch pgAdmin:

1. **Press** Windows key
2. **Type:** `pgAdmin`
3. **Click** pgAdmin 4
4. **Enter** master password (if asked)

### Connect to Database:

1. **Expand** "Servers"
2. **Click** "PostgreSQL 16"
3. **Enter** your password
4. **Expand** "Databases"
5. **Click** "student_bug_tracker"
6. **Expand** "Schemas" → "public" → "Tables"

You should see all your tables:
- users
- projects
- tasks
- bugs
- activities
- etc.

✅ **You can now browse your database visually!**

---

## 🎉 Success Checklist

- [x] PostgreSQL installed
- [x] Database created
- [x] .env file updated
- [x] Migrations run
- [x] Prisma client generated
- [x] Backend server started
- [x] Database connected
- [x] API endpoints working

---

## ❓ Troubleshooting

### Problem: "psql: command not found"

**Solution:** Add PostgreSQL to PATH

1. **Press** Windows + R
2. **Type:** `sysdm.cpl`
3. **Click** "Environment Variables"
4. **Find** "Path" in System variables
5. **Click** "Edit"
6. **Click** "New"
7. **Add:** `C:\Program Files\PostgreSQL\16\bin`
8. **Click** OK
9. **Restart** terminal

### Problem: "password authentication failed"

**Solution:** Check your password

1. **Open** `.env` file
2. **Make sure** password matches what you set
3. **Try** resetting password:
   ```cmd
   cd "C:\Program Files\PostgreSQL\16\bin"
   psql -U postgres
   ALTER USER postgres WITH PASSWORD 'newpassword';
   ```

### Problem: "database does not exist"

**Solution:** Create the database

```cmd
cd "C:\Program Files\PostgreSQL\16\bin"
psql -U postgres
CREATE DATABASE student_bug_tracker;
\q
```

### Problem: "port 5432 already in use"

**Solution:** Stop other PostgreSQL instances

1. **Press** Windows + R
2. **Type:** `services.msc`
3. **Find** "postgresql-x64-16"
4. **Right-click** → Restart

### Problem: "Prisma migrate failed"

**Solution:** Reset migrations

```bash
cd backend
rm -rf prisma/migrations
npx prisma migrate dev --name init
```

---

## 🔄 Quick Commands Reference

### Start PostgreSQL Service:
```cmd
net start postgresql-x64-16
```

### Stop PostgreSQL Service:
```cmd
net stop postgresql-x64-16
```

### Connect to Database:
```cmd
cd "C:\Program Files\PostgreSQL\16\bin"
psql -U postgres -d student_bug_tracker
```

### View Tables:
```sql
\dt
```

### View Table Data:
```sql
SELECT * FROM users;
```

### Exit psql:
```sql
\q
```

---

## 🎯 Next Steps

Now that PostgreSQL is installed and connected:

1. ✅ **Backend is running** with database
2. ✅ **API endpoints** are working
3. ✅ **Data persists** in PostgreSQL
4. ⚠️ **Frontend** still uses localStorage

### To Connect Frontend to Backend:

See `CONNECT_FRONTEND_TO_BACKEND.md` for instructions on how to make the frontend use the backend API instead of localStorage.

---

## 📚 Useful Resources

- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **pgAdmin Docs:** https://www.pgadmin.org/docs/
- **Prisma Docs:** https://www.prisma.io/docs/
- **SQL Tutorial:** https://www.w3schools.com/sql/

---

**Congratulations! PostgreSQL is installed and connected! 🎉**
