# 🔍 Website Status Check

## Current Status

### ✅ Backend API Working
- **URL:** http://localhost:5000
- **Health:** ✅ Connected
- **Database:** ✅ PostgreSQL connected
- **Test Registration:** ✅ Working (created testuser@example.com)

### ✅ Frontend Server Running
- **URL:** http://localhost:3000
- **Status:** ✅ Compiling successfully
- **Next.js:** ✅ Ready
- **Environment:** ✅ .env.local loaded

---

## 🧪 Quick Tests

### Test 1: Backend Health
```bash
curl http://localhost:5000/api/v1/health
```
**Expected:** `{"status":"ok","database":"connected"}`
**Result:** ✅ Working

### Test 2: User Registration
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","role":"developer"}'
```
**Expected:** Success with JWT token
**Result:** ✅ Working

### Test 3: Frontend Access
```bash
curl http://localhost:3000
```
**Expected:** HTML page
**Result:** ✅ Working

---

## 🔧 What to Check

### If Website Not Loading:

1. **Check Browser Console**
   - Open DevTools (F12)
   - Look for JavaScript errors
   - Check Network tab for failed requests

2. **Check URLs**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

3. **Clear Browser Cache**
   - Hard refresh: Ctrl+Shift+R
   - Clear localStorage: DevTools → Application → Local Storage → Clear

4. **Check Processes**
   ```bash
   # Frontend should be running
   curl http://localhost:3000
   
   # Backend should be running  
   curl http://localhost:5000/api/v1/health
   ```

---

## 🎯 Expected Behavior

### When You Visit http://localhost:3000:

1. **First Visit:**
   - Should show login page
   - No authentication token exists

2. **After Registration:**
   - Form submits to backend API
   - JWT token stored in localStorage
   - Redirect to dashboard

3. **Dashboard Access:**
   - Protected route checks for token
   - If valid → show dashboard
   - If invalid → redirect to login

---

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot connect to backend"
**Solution:**
```bash
# Check if backend is running
curl http://localhost:5000/api/v1/health

# If not running, start it:
cd backend && npm run dev
```

### Issue 2: "Login not working"
**Solution:**
- Check browser console for errors
- Verify API calls in Network tab
- Try registering a new user first

### Issue 3: "Dashboard not loading"
**Solution:**
- Check if JWT token exists in localStorage
- Clear localStorage and login again
- Check for JavaScript errors

### Issue 4: "Compilation errors"
**Solution:**
```bash
# Stop frontend
Ctrl+C

# Restart frontend
cd frontend && npm run dev
```

---

## 📊 Current Architecture

```
Browser → http://localhost:3000 (Frontend)
    ↓
Next.js App → API calls → http://localhost:5000 (Backend)
    ↓
Express Server → Prisma ORM → PostgreSQL Database
```

---

## 🔍 Debug Steps

### Step 1: Test Backend Directly
```bash
# Health check
curl http://localhost:5000/api/v1/health

# Register user
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Debug User","email":"debug@test.com","password":"password123","role":"developer"}'

# Login user
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"debug@test.com","password":"password123"}'
```

### Step 2: Test Frontend
```bash
# Access homepage
curl http://localhost:3000

# Should return HTML with login page
```

### Step 3: Test in Browser
```
1. Open http://localhost:3000
2. Open DevTools (F12)
3. Check Console for errors
4. Check Network tab for API calls
5. Try registering a new user
```

---

## 📝 What Should Happen

### Registration Flow:
```
1. User fills registration form
2. Form submits to: POST /api/v1/auth/register
3. Backend creates user in database
4. Backend returns JWT token
5. Frontend stores token in localStorage
6. Frontend redirects to dashboard
```

### Login Flow:
```
1. User fills login form
2. Form submits to: POST /api/v1/auth/login
3. Backend validates credentials
4. Backend returns JWT token
5. Frontend stores token in localStorage
6. Frontend redirects to dashboard
```

### Dashboard Access:
```
1. User visits /dashboard
2. ProtectedRoute checks for JWT token
3. If token exists → show dashboard
4. If no token → redirect to login
```

---

## 🎯 Test Account

You can use this test account that was just created:
- **Email:** testuser@example.com
- **Password:** password123

Or register a new account at http://localhost:3000/register

---

## 🚀 Quick Fix Commands

### Restart Everything:
```bash
# Terminal 1 - Backend
cd student-bug-tracker/backend
npm run dev

# Terminal 2 - Frontend  
cd student-bug-tracker/frontend
npm run dev
```

### Clear Browser Data:
```
1. Open DevTools (F12)
2. Application tab
3. Local Storage → Clear All
4. Hard refresh (Ctrl+Shift+R)
```

---

**If you're still having issues, please:**
1. Open http://localhost:3000 in your browser
2. Open DevTools (F12) 
3. Check Console tab for any error messages
4. Let me know what errors you see!

The backend is definitely working, so any issues are likely in the frontend connection or browser-related.