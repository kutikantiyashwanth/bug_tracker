# Time Tracking Summary

## Current Implementation

Time tracking is implemented on the frontend using Zustand with localStorage persistence.

## What's Stored
- Timer start/stop per task or bug
- Manual time entries (hours + minutes)
- Description per entry
- Date of entry

## Aggregations Available
- Total time per task
- Total time per bug
- Total time per user
- Total time per project

## Storage Location
Currently stored in browser localStorage via Zustand persist middleware.
Key: `student-bug-tracker-api-store`

## Future Enhancement
Time entries can be moved to the database by:
1. Adding a `TimeEntry` model to `prisma/schema.prisma`
2. Creating POST/GET endpoints in `backend/src/index.ts`
3. Updating `store-api.ts` to call the API instead of local storage

## Access
Go to **Time Tracking** in the dashboard sidebar (Admin and Developer roles only).
