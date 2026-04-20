# ✅ Complete Database Setup - Final Steps

## Current Status:
- ✅ PostgreSQL installed
- ✅ Service running (postgresql-x64-16)
- ✅ psql.exe available
- ⚠️ Database needs to be created
- ⚠️ .env needs password update

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Create the Database

Open **Command Prompt** or **PowerShell** and run:

```powershell
# Connect to PostgreSQL (you'll be asked for password)
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres

# After entering password, you'll see: postgres=#
# Now create the database:
CREATE DATABASE student_bug_tracker;

# You should see: CREATE DATABASE

# Verify it was created:
\l

# You should see student_bug_tracker in the list

# Exit:
\q
```

**Note:** The password is what you set during PostgreSQL installation.

---

### Step 2: Update .env File

1. Open: `student-bug-tracker/backend/.env`
2. Find this line:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/student_bug_tracker"
   ```
3. Replace `password` with YOUR PostgreSQL password
4. Save the file

**Example:** If your password is `postgres`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/student_bug_tracker"
```

---

### Step 3: Run Database Migrations

Open terminal in VS Code and run:

```bash
cd student-bug-tracker/backend
npx prisma migrate dev --name init
```

**Expected output:**
```
✔ Generated Prisma Client
✔ Applied migration: 20260418_init
```

---

### Step 4: Generate Prisma Client

```bash
npx prisma generate
```

**Expected output:**
```
✔ Generated Prisma Client
```

---

### Step 5: Restart Backend Server

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

---

### Step 6: Test Database Connection

Open a new terminal and run:

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

✅ **If you see this, database is connected!**

---

## 🎯 One-Command Setup (Alternative)

If you know your PostgreSQL password, you can do everything in one go:

```powershell
# Replace YOUR_PASSWORD with your actual password
$env:PGPASSWORD="YOUR_PASSWORD"; & "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -c "CREATE DATABASE student_bug_tracker;"
```

Then continue with Step 2 above.

---

## ❓ Common Issues

### Issue 1: "password authentication failed"

**Solution:** Check your password
- The password is what you set during PostgreSQL installation
- Try common passwords: `postgres`, `admin`, `password`
- If forgotten, you may need to reset it

### Issue 2: "database already exists"

**Solution:** Database is already created! Skip Step 1 and go to Step 2.

### Issue 3: "psql: command not found"

**Solution:** Use full path:
```powershell
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres
```

### Issue 4: "Prisma migrate failed"

**Solution:** Make sure .env has correct password, then:
```bash
cd backend
rm -rf prisma/migrations
npx prisma migrate dev --name init
```

---

## 🔍 Verify Everything Works

### Check Database Tables:

```bash
cd backend
npx prisma studio
```

Opens browser at `http://localhost:5555` - you should see all tables!

### Test API Registration:

```bash
curl -X POST http://localhost:5000/api/v1/auth/register -H "Content-Type: application/json" -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"password123\",\"role\":\"developer\"}"
```

Should return success with user data!

---

## 🎉 Success Checklist

- [ ] PostgreSQL service running
- [ ] Database created (`student_bug_tracker`)
- [ ] .env file updated with correct password
- [ ] Prisma migrations run
- [ ] Prisma client generated
- [ ] Backend server started
- [ ] Health check returns "connected"
- [ ] Can register users via API

---

## 📝 What's Your PostgreSQL Password?

**Common passwords people use:**
- `postgres` (most common)
- `admin`
- `password`
- `root`
- Custom password you set

**To find out:**
1. Try connecting: `& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres`
2. Enter different passwords until one works
3. Once you know it, update the .env file

---

## 🚀 Next Steps After Setup

Once database is connected:

1. ✅ Backend will store data in PostgreSQL
2. ✅ Data persists across server restarts
3. ✅ Multiple users can share data
4. ⚠️ Frontend still uses localStorage (optional to connect)

To connect frontend to backend, see: `CONNECT_FRONTEND_TO_BACKEND.md`

---

**Need help? Let me know which step you're stuck on!**
