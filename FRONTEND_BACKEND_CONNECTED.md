# Frontend Backend Connected

## Connection Status: WORKING

The frontend is connected to the backend API.

## URLs
- Frontend: https://bug-tracker-ui-evqv.onrender.com
- Backend: https://bug-tracker-api-d117.onrender.com

## How the Connection Works

1. Frontend is built with `NEXT_PUBLIC_API_URL` baked in at build time
2. All API calls use Axios with base URL pointing to the backend
3. JWT token stored in `localStorage` is attached to every request
4. Socket.io connects to `NEXT_PUBLIC_SOCKET_URL` for real-time events

## Environment Variables Set on Render
```
NEXT_PUBLIC_API_URL=https://bug-tracker-api-d117.onrender.com/api/v1
NEXT_PUBLIC_SOCKET_URL=https://bug-tracker-api-d117.onrender.com
```

## Test the Connection
1. Open https://bug-tracker-ui-evqv.onrender.com
2. Click "Try Demo Account"
3. You should be logged in within 1-2 seconds
