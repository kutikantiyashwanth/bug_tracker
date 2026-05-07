# Connect Frontend to Backend

## Frontend Environment Variables

Set these in your `.env.local` (local) or Render dashboard (production):

```env
NEXT_PUBLIC_API_URL=https://bug-tracker-api-d117.onrender.com/api/v1
NEXT_PUBLIC_SOCKET_URL=https://bug-tracker-api-d117.onrender.com
```

## For Local Development

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## How It Works
1. Frontend reads `NEXT_PUBLIC_API_URL` at build time
2. All API calls go through `src/lib/api.ts` (Axios instance)
3. JWT token is attached automatically from localStorage
4. Socket.io connects to `NEXT_PUBLIC_SOCKET_URL` on login

## Verify Connection
Open browser console on the frontend and check for:
- No CORS errors
- 200 responses from `/api/v1/auth/login`
- Socket connected message
