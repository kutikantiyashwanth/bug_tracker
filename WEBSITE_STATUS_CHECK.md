# Website Status Check

## How to Check if Everything is Working

### 1. Backend Health
Open in browser:
```
https://bug-tracker-api-d117.onrender.com/api/v1/health
```
Expected response:
```json
{"status":"ok","database":"connected"}
```

### 2. Frontend
Open in browser:
```
https://bug-tracker-ui-evqv.onrender.com
```
Expected: Login page loads

### 3. Login Test
- Click Try Demo Account
- Should redirect to dashboard within 2 seconds

### 4. Database Check (Local)
```bash
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d student_bug_tracker -c "SELECT COUNT(*) FROM users;"
```
Expected: 17 or more rows

### Status Summary
| Service | URL | Expected |
|---|---|---|
| Backend | /api/v1/health | status: ok |
| Frontend | / | Login page |
| Database | localhost:5432 | Connected |
