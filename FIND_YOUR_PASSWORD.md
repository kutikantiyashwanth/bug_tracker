# 🔐 Find Your PostgreSQL Password

## ❓ What Password Did You Set?

During PostgreSQL installation, you were asked to set a password for the `postgres` user.

**This is the password you need!**

---

## 🎯 Quick Test - Try These Common Passwords

Open **PowerShell** or **Command Prompt** and try these commands:

### Try 1: "postgres"
```powershell
$env:PGPASSWORD="postgres"; & "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -c "\l"
```

### Try 2: "password"
```powershell
$env:PGPASSWORD="password"; & "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -c "\l"
```

### Try 3: "admin"
```powershell
$env:PGPASSWORD="admin"; & "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -c "\l"
```

### Try 4: "root"
```powershell
$env:PGPASSWORD="root"; & "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -c "\l"
```

### Try 5: "123456"
```powershell
$env:PGPASSWORD="123456"; & "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -c "\l"
```

**If one works, you'll see a list of databases!** ✅

---

## 🔍 Manual Test

If none of the above work, try manually:

```powershell
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres
```

**It will ask:** `Password for user postgres:`

**Try different passwords until one works!**

---

## ✅ Once You Find the Password

1. **Remember it!** Write it down
2. **Update .env file:**
   - Open: `student-bug-tracker/backend/.env`
   - Find: `DATABASE_URL="postgresql://postgres:password@localhost:5432/student_bug_tracker"`
   - Replace `password` with YOUR password
   - Save

3. **Tell me the password** so I can help you create the database!

---

## 🔄 Forgot Password? Reset It

If you can't remember, you can reset it:

### Step 1: Find pg_hba.conf

```powershell
Get-Content "C:\Program Files\PostgreSQL\16\data\pg_hba.conf" | Select-String "IPv4"
```

### Step 2: Edit pg_hba.conf (as Administrator)

1. Open Notepad as Administrator
2. Open: `C:\Program Files\PostgreSQL\16\data\pg_hba.conf`
3. Find this line:
   ```
   host    all             all             127.0.0.1/32            scram-sha-256
   ```
4. Change `scram-sha-256` to `trust`:
   ```
   host    all             all             127.0.0.1/32            trust
   ```
5. Save the file

### Step 3: Restart PostgreSQL

```powershell
Restart-Service postgresql-x64-16
```

### Step 4: Connect Without Password

```powershell
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres
```

### Step 5: Set New Password

```sql
ALTER USER postgres WITH PASSWORD 'newpassword';
```

### Step 6: Restore pg_hba.conf

1. Change `trust` back to `scram-sha-256`
2. Save
3. Restart service:
   ```powershell
   Restart-Service postgresql-x64-16
   ```

### Step 7: Test New Password

```powershell
$env:PGPASSWORD="newpassword"; & "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -c "\l"
```

---

## 📝 What to Do Next

**Once you know your password:**

1. Tell me: "My password is: [your_password]"
2. I'll help you:
   - Create the database
   - Update .env file
   - Run migrations
   - Test connection

---

## 🎯 Quick Summary

**You need to:**
1. Find your PostgreSQL password (try common ones above)
2. Tell me what it is
3. I'll complete the setup for you!

**Or:**
- Reset the password using the steps above
- Then tell me the new password

---

**Let me know your password and I'll finish the setup!** 🚀
