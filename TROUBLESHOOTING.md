# Troubleshooting

## Login Not Working

**Problem:** Cannot connect to server error on login
**Fix:** The backend may be sleeping (Render free tier). Wait 30-60 seconds and try again.

**Problem:** Wrong email or password
**Fix:** Use demo accounts — admin@test.com / password123

---

## Backend Returns 404

**Problem:** API calls return 404
**Fix:** Check that `NEXT_PUBLIC_API_URL` is set to `https://bug-tracker-api-d117.onrender.com/api/v1`

---

## Frontend Shows Blank Page

**Problem:** White screen after deploy
**Fix:** Check Render static site env vars are set and trigger a redeploy

---

## Database Connection Error

**Problem:** `DATABASE_URL resolved to empty string`
**Fix:** Set `DATABASE_URL` in Render backend environment variables from your PostgreSQL service

---

## TypeScript Build Error TS5109

**Problem:** `moduleResolution must be NodeNext`
**Fix:** Clear Render build cache — go to service settings and click "Clear build cache & deploy"

---

## Invite Code Not Working

**Problem:** Invalid invite code error when joining
**Fix:** Make sure you are copying the full UUID (e.g. `539c5256-5439-4834-b53a-c90f00d53920`). Do not add spaces or convert to uppercase.

---

## Real-time Not Working

**Problem:** Task moves not syncing to other users
**Fix:** Check `NEXT_PUBLIC_SOCKET_URL` is set correctly. Socket.io requires the backend URL without `/api/v1`.

---

## Redis / Email Warnings

**Problem:** Logs show Redis or email warnings
**Fix:** These are optional. The app works fully without Redis or SMTP configured.
- Redis: Leave `REDIS_URL` empty
- Email: Leave SMTP vars empty — in-app notifications still work
