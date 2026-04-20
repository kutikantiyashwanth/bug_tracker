# 🧪 How to Test Your Website

## ✅ Website is Working!

Your website is running correctly at **http://localhost:3000**

---

## 🎯 What Changed

### Before (localStorage):
- Demo account: alex@team.dev worked
- Data stored in browser only

### After (API Connected):
- Need to register new accounts
- Data stored in PostgreSQL database
- Old demo account won't work anymore

---

## 🚀 How to Test

### Step 1: Open Website
```
Go to: http://localhost:3000
```
You should see the **login page** with:
- Email field
- Password field  
- "Sign up" link
- "Try Demo Account" button

### Step 2: Register New Account
```
1. Click "Sign up" 
2. Fill in the form:
   - Name: Your Name
   - Email: your@email.com
   - Password: password123 (min 6 chars)
   - Role: Developer/Tester/Admin
3. Click "Create Account"
```

**What happens:**
- Form sends data to backend API
- User created in PostgreSQL database
- JWT token returned and stored
- Automatic redirect to dashboard

### Step 3: Test Login
```
1. Go back to login page
2. Enter your credentials
3. Click "Sign In"
```

**What happens:**
- Credentials verified against database
- JWT token returned if valid
- Redirect to dashboard

### Step 4: Test Features
```
Once logged in, test:
- Create a project
- Add tasks to Kanban board
- Report bugs
- Track time
- View analytics
```

**What happens:**
- All data saved to PostgreSQL
- Real-time updates
- Persistent storage

---

## 🧪 Quick Test Account

I already created a test account for you:
- **Email:** testuser@example.com
- **Password:** password123

Try logging in with these credentials!

---

## 🔍 Troubleshooting

### Issue: "Login page not loading"
**Check:**
```bash
# Is frontend running?
curl http://localhost:3000

# Should return HTML with login form
```

### Issue: "Can't register/login"
**Check:**
```bash
# Is backend running?
curl http://localhost:5000/api/v1/health

# Should return: {"status":"ok","database":"connected"}
```

### Issue: "Old demo account not working"
**Solution:** 
- The old alex@team.dev account was localStorage-only
- You need to register a new account
- New accounts are saved in PostgreSQL

### Issue: "Dashboard not loading"
**Check:**
1. Open browser DevTools (F12)
2. Check Console for errors
3. Check Network tab for API calls
4. Clear localStorage and try again

---

## 🎯 Expected Flow

### Registration:
```
1. Fill form → 2. API call → 3. Database save → 4. JWT token → 5. Dashboard
```

### Login:
```
1. Enter credentials → 2. API verify → 3. JWT token → 4. Dashboard
```

### Using App:
```
1. Create project → 2. API call → 3. Database save → 4. UI update
```

---

## 📊 What's Different Now

| Feature | Before (localStorage) | After (API) |
|---------|----------------------|-------------|
| **Demo Account** | alex@team.dev | Need to register |
| **Data Storage** | Browser only | PostgreSQL database |
| **Persistence** | Lost on clear | Permanent |
| **Multi-user** | No | Yes |
| **Real-time** | No | Ready |

---

## 🎉 Test Checklist

- [ ] Open http://localhost:3000
- [ ] See login page
- [ ] Click "Sign up"
- [ ] Register new account
- [ ] Get redirected to dashboard
- [ ] Create a project
- [ ] Add some tasks
- [ ] Report a bug
- [ ] Check database has data

---

## 🔧 Verify Database

After testing, check your data is saved:

```bash
# Connect to database
$env:PGPASSWORD="Yashwanth"; psql -U postgres -d student_bug_tracker

# Check users
SELECT * FROM users;

# Check projects  
SELECT * FROM projects;

# Check tasks
SELECT * FROM tasks;

# Exit
\q
```

You should see your registered user and created data!

---

## 🚀 Quick Commands

### Start Servers:
```bash
# Backend
cd backend && npm run dev

# Frontend  
cd frontend && npm run dev
```

### Test APIs:
```bash
# Health check
curl http://localhost:5000/api/v1/health

# Register user
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"password123","role":"developer"}'
```

---

## 🎯 Summary

**Your website IS working!** 

The difference is:
- ✅ Frontend: http://localhost:3000 (working)
- ✅ Backend: http://localhost:5000 (working)  
- ✅ Database: PostgreSQL (connected)
- ⚠️ Need to register new accounts (old demo won't work)

**Try it now:**
1. Go to http://localhost:3000
2. Click "Sign up"
3. Register your account
4. Start using the app!

All your data will be saved in the PostgreSQL database! 🎉