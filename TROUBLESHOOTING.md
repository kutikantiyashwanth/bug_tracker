# 🔧 Troubleshooting Guide

## ✅ Current Status

**Backend:** ✅ Running (http://localhost:5000)
**Frontend:** ✅ Running (http://localhost:3000)
**Database:** ✅ Connected

Both servers are responding correctly!

---

## 🎯 How to Access Your Website

### Step 1: Open Your Browser
1. Open **Google Chrome**, **Firefox**, or **Edge**
2. Type in the address bar: `http://localhost:3000`
3. Press Enter

### Step 2: What You Should See
- **Login Page** with email and password fields
- "Sign up" link at the bottom
- "Try Demo Account" button

### Step 3: Register or Login
**Option A - Register New Account:**
1. Click "Sign up"
2. Fill in:
   - Name: Your Name
   - Email: your@email.com
   - Password: password123 (min 6 chars)
   - Role: Developer
3. Click "Create Account"

**Option B - Use Test Account:**
- Email: `testuser@example.com`
- Password: `password123`

---

## ❓ Common Issues & Solutions

### Issue 1: "Page Not Loading"

**Check:**
```
1. Is the URL correct? http://localhost:3000
2. Are you using http:// (not https://)?
3. Is your browser blocking the page?
```

**Solution:**
- Try clearing browser cache (Ctrl+Shift+Delete)
- Try a different browser
- Try incognito/private mode

### Issue 2: "Cannot Connect" Error

**Check if servers are running:**

Open **Command Prompt** or **PowerShell** and run:
```bash
# Check if frontend is running
curl http://localhost:3000

# Check if backend is running
curl http://localhost:5000/api/v1/health
```

**If not running, start them:**
```bash
# Terminal 1 - Backend
cd student-bug-tracker/backend
npm run dev

# Terminal 2 - Frontend
cd student-bug-tracker/frontend
npm run dev
```

### Issue 3: "Login Not Working"

**Solution:**
1. Make sure you're using the correct credentials
2. Try registering a new account first
3. Check browser console for errors (F12)

### Issue 4: "Blank Page" or "Loading Forever"

**Solution:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for any red error messages
4. Clear localStorage:
   - DevTools → Application → Local Storage
   - Right-click → Clear
5. Refresh page (Ctrl+R)

### Issue 5: "Old Demo Account Not Working"

**This is normal!**
- The old `alex@team.dev` account was localStorage-only
- You need to register a new account
- New accounts are saved in the database

---

## 🧪 Quick Test

### Test 1: Can you access the login page?
```
1. Open browser
2. Go to: http://localhost:3000
3. Do you see a login form?
   - YES → Continue to Test 2
   - NO → See "Issue 1" above
```

### Test 2: Can you register?
```
1. Click "Sign up"
2. Fill in the form
3. Click "Create Account"
4. Are you redirected to dashboard?
   - YES → Success! ✅
   - NO → Check browser console (F12)
```

### Test 3: Can you login?
```
1. Use: testuser@example.com / password123
2. Click "Sign In"
3. Are you redirected to dashboard?
   - YES → Success! ✅
   - NO → Check browser console (F12)
```

---

## 🔍 Debug Steps

### Step 1: Check Browser Console
```
1. Press F12 to open DevTools
2. Click "Console" tab
3. Look for red error messages
4. Take a screenshot if you see errors
```

### Step 2: Check Network Tab
```
1. Press F12 to open DevTools
2. Click "Network" tab
3. Try to login/register
4. Look for failed requests (red)
5. Click on failed request to see details
```

### Step 3: Check localStorage
```
1. Press F12 to open DevTools
2. Click "Application" tab
3. Expand "Local Storage"
4. Click "http://localhost:3000"
5. Do you see a "token" entry?
   - YES → You're logged in
   - NO → You need to login
```

---

## 📸 What Should You See?

### Login Page:
```
┌─────────────────────────────────┐
│  🐛 Student Bug Tracker         │
│                                 │
│  Welcome back                   │
│  Sign in to your account        │
│                                 │
│  Email: [____________]          │
│  Password: [____________]       │
│                                 │
│  [    Sign In    ]              │
│                                 │
│  or                             │
│                                 │
│  [ 🐛 Try Demo Account ]        │
│                                 │
│  Don't have an account? Sign up │
└─────────────────────────────────┘
```

### Dashboard (After Login):
```
┌─────────────────────────────────┐
│  Welcome back, [Your Name]      │
│  Here's what's happening...     │
│                                 │
│  📊 Statistics                  │
│  📋 Recent Tasks                │
│  🐛 Recent Bugs                 │
│  📈 Activity                    │
└─────────────────────────────────┘
```

---

## 🚀 Start Fresh

If nothing works, try starting fresh:

### Step 1: Stop Everything
```bash
# Press Ctrl+C in both terminals
```

### Step 2: Clear Browser Data
```
1. Open browser
2. Press Ctrl+Shift+Delete
3. Select "All time"
4. Check "Cookies" and "Cached images"
5. Click "Clear data"
```

### Step 3: Restart Servers
```bash
# Terminal 1 - Backend
cd student-bug-tracker/backend
npm run dev

# Terminal 2 - Frontend
cd student-bug-tracker/frontend
npm run dev
```

### Step 4: Try Again
```
1. Open browser
2. Go to: http://localhost:3000
3. Register new account
4. Should work now!
```

---

## 📞 Need More Help?

### Tell me:
1. **What do you see?**
   - Blank page?
   - Error message?
   - Login page?
   - Something else?

2. **What happens when you try to login/register?**
   - Nothing?
   - Error message?
   - Redirects somewhere?

3. **Any error messages in browser console?** (F12 → Console)
   - Copy and paste the error

4. **Which browser are you using?**
   - Chrome?
   - Firefox?
   - Edge?

---

## ✅ Quick Checklist

Before asking for help, check:

- [ ] I opened http://localhost:3000 in my browser
- [ ] I see the login page
- [ ] I tried registering a new account
- [ ] I checked browser console for errors (F12)
- [ ] Backend is running (http://localhost:5000/api/v1/health shows "ok")
- [ ] Frontend is running (http://localhost:3000 loads)
- [ ] I tried clearing browser cache
- [ ] I tried a different browser

---

## 🎯 Most Common Solution

**90% of the time, this fixes it:**

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Clear localStorage** (F12 → Application → Local Storage → Clear)
3. **Hard refresh** (Ctrl+Shift+R)
4. **Try registering a new account** (don't use old demo account)

---

**The servers are running correctly! The issue is likely browser-related.** 

**Try the steps above and let me know what you see!** 🚀