-- ═══════════════════════════════════════════════════════════
--   Student Bug Tracker — Supabase SQL Queries
--   Go to: supabase.com → your project → SQL Editor
--   Paste any query below and click RUN
-- ═══════════════════════════════════════════════════════════



-- ─── 1. DASHBOARD SUMMARY (run this first) ───────────────
SELECT 
  (SELECT COUNT(*) FROM users)         AS total_users,
  (SELECT COUNT(*) FROM projects)      AS total_projects,
  (SELECT COUNT(*) FROM tasks)         AS total_tasks,
  (SELECT COUNT(*) FROM bugs)          AS total_bugs,
  (SELECT COUNT(*) FROM comments)      AS total_comments,
  (SELECT COUNT(*) FROM notifications) AS total_notifications,
  (SELECT COUNT(*) FROM activity_logs) AS total_activities,
  (SELECT COUNT(*) FROM sprints)       AS total_sprints;


-- ─── 2. ALL USERS ────────────────────────────────────────
SELECT 
  id, name, email, role, skills, "createdAt"
FROM users
ORDER BY "createdAt" DESC;


-- ─── 3. ALL PROJECTS WITH OWNER ──────────────────────────
SELECT 
  p.id,
  p.name        AS project_name,
  p.description,
  p."inviteCode",
  u.name        AS owner,
  u.email       AS owner_email,
  p."createdAt"
FROM projects p
JOIN users u ON p."ownerId" = u.id
ORDER BY p."createdAt" DESC;


-- ─── 4. PROJECT MEMBERS WITH ROLES ───────────────────────
SELECT 
  p.name  AS project,
  u.name  AS member,
  u.email AS member_email,
  pm.role,
  pm."joinedAt"
FROM project_members pm
JOIN users    u ON pm."userId"    = u.id
JOIN projects p ON pm."projectId" = p.id
ORDER BY pm."joinedAt" DESC;


-- ─── 5. ALL TASKS ────────────────────────────────────────
SELECT 
  t.title,
  t.status,
  t.priority,
  t."dueDate",
  u.name  AS assignee,
  c.name  AS created_by,
  p.name  AS project,
  t.tags,
  t."createdAt"
FROM tasks t
LEFT JOIN users    u ON t."assigneeId"  = u.id
LEFT JOIN users    c ON t."createdById" = c.id
LEFT JOIN projects p ON t."projectId"   = p.id
ORDER BY t."createdAt" DESC;


-- ─── 6. ALL BUGS ─────────────────────────────────────────
SELECT 
  b.title,
  b.severity,
  b.status,
  r.name  AS reporter,
  r.email AS reporter_email,
  a.name  AS assignee,
  p.name  AS project,
  b."createdAt"
FROM bugs b
JOIN users    r ON b."reporterId" = r.id
LEFT JOIN users    a ON b."assigneeId" = a.id
LEFT JOIN projects p ON b."projectId"  = p.id
ORDER BY b."createdAt" DESC;


-- ─── 7. ALL COMMENTS ─────────────────────────────────────
SELECT 
  c.content,
  u.name  AS author,
  u.email AS author_email,
  b.title AS bug_title,
  t.title AS task_title,
  c."createdAt"
FROM comments c
JOIN users u ON c."userId" = u.id
LEFT JOIN bugs  b ON c."bugId"  = b.id
LEFT JOIN tasks t ON c."taskId" = t.id
ORDER BY c."createdAt" DESC;


-- ─── 8. ALL NOTIFICATIONS ────────────────────────────────
SELECT 
  u.name  AS user,
  u.email AS user_email,
  n.type,
  n.title,
  n.message,
  n.read,
  n."createdAt"
FROM notifications n
JOIN users u ON n."userId" = u.id
ORDER BY n."createdAt" DESC;


-- ─── 9. ACTIVITY LOG ─────────────────────────────────────
SELECT 
  u.name  AS user,
  al.action,
  al."entityType",
  al.details,
  p.name  AS project,
  al."createdAt"
FROM activity_logs al
JOIN users    u ON al."userId"    = u.id
JOIN projects p ON al."projectId" = p.id
ORDER BY al."createdAt" DESC;


-- ─── 10. OPEN CRITICAL BUGS ──────────────────────────────
SELECT 
  b.title,
  b.severity,
  b.status,
  r.name AS reporter,
  a.name AS assignee,
  p.name AS project,
  b."createdAt"
FROM bugs b
JOIN users    r ON b."reporterId" = r.id
LEFT JOIN users    a ON b."assigneeId" = a.id
LEFT JOIN projects p ON b."projectId"  = p.id
WHERE b.severity = 'CRITICAL' 
  AND b.status NOT IN ('CLOSED', 'RESOLVED')
ORDER BY b."createdAt" DESC;


-- ─── 11. TASKS WITH UPCOMING DEADLINES ───────────────────
SELECT 
  t.title,
  t.status,
  t.priority,
  t."dueDate",
  u.name AS assignee,
  p.name AS project,
  ROUND(EXTRACT(EPOCH FROM (t."dueDate" - NOW())) / 3600) AS hours_left
FROM tasks t
LEFT JOIN users    u ON t."assigneeId" = u.id
LEFT JOIN projects p ON t."projectId"  = p.id
WHERE t."dueDate" > NOW()
  AND t.status != 'DONE'
ORDER BY t."dueDate" ASC;


-- ─── 12. UNREAD NOTIFICATIONS PER USER ───────────────────
SELECT 
  u.name,
  u.email,
  COUNT(*) AS unread_count
FROM notifications n
JOIN users u ON n."userId" = u.id
WHERE n.read = false
GROUP BY u.name, u.email
ORDER BY unread_count DESC;


-- ─── 13. BUG STATS BY PROJECT ────────────────────────────
SELECT 
  p.name AS project,
  COUNT(*)                                          AS total_bugs,
  COUNT(*) FILTER (WHERE b.status = 'OPEN')        AS open,
  COUNT(*) FILTER (WHERE b.status = 'IN_PROGRESS') AS in_progress,
  COUNT(*) FILTER (WHERE b.status = 'RESOLVED')    AS resolved,
  COUNT(*) FILTER (WHERE b.status = 'CLOSED')      AS closed,
  COUNT(*) FILTER (WHERE b.severity = 'CRITICAL')  AS critical
FROM bugs b
JOIN projects p ON b."projectId" = p.id
GROUP BY p.name
ORDER BY total_bugs DESC;


-- ─── 14. TASK STATS BY PROJECT ───────────────────────────
SELECT 
  p.name AS project,
  COUNT(*)                                            AS total_tasks,
  COUNT(*) FILTER (WHERE t.status = 'BACKLOG')       AS backlog,
  COUNT(*) FILTER (WHERE t.status = 'TODO')          AS todo,
  COUNT(*) FILTER (WHERE t.status = 'IN_PROGRESS')   AS in_progress,
  COUNT(*) FILTER (WHERE t.status = 'TESTING')       AS testing,
  COUNT(*) FILTER (WHERE t.status = 'DONE')          AS done
FROM tasks t
JOIN projects p ON t."projectId" = p.id
GROUP BY p.name
ORDER BY total_tasks DESC;


-- ─── 15. SPRINTS ─────────────────────────────────────────
SELECT 
  s.name,
  s.goal,
  s.status,
  s."startDate",
  s."endDate",
  p.name AS project,
  array_length(s."taskIds", 1) AS task_count
FROM sprints s
JOIN projects p ON s."projectId" = p.id
ORDER BY s."createdAt" DESC;
