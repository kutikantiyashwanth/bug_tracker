-- CreateIndex
CREATE INDEX "activity_logs_projectId_createdAt_idx" ON "activity_logs"("projectId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "activity_logs_userId_idx" ON "activity_logs"("userId");

-- CreateIndex
CREATE INDEX "activity_logs_entityType_entityId_idx" ON "activity_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "bugs_projectId_idx" ON "bugs"("projectId");

-- CreateIndex
CREATE INDEX "bugs_projectId_status_idx" ON "bugs"("projectId", "status");

-- CreateIndex
CREATE INDEX "bugs_projectId_severity_idx" ON "bugs"("projectId", "severity");

-- CreateIndex
CREATE INDEX "bugs_projectId_status_severity_idx" ON "bugs"("projectId", "status", "severity");

-- CreateIndex
CREATE INDEX "bugs_assigneeId_idx" ON "bugs"("assigneeId");

-- CreateIndex
CREATE INDEX "bugs_reporterId_idx" ON "bugs"("reporterId");

-- CreateIndex
CREATE INDEX "bugs_createdAt_idx" ON "bugs"("createdAt");

-- CreateIndex
CREATE INDEX "comments_bugId_createdAt_idx" ON "comments"("bugId", "createdAt");

-- CreateIndex
CREATE INDEX "comments_taskId_createdAt_idx" ON "comments"("taskId", "createdAt");

-- CreateIndex
CREATE INDEX "comments_userId_idx" ON "comments"("userId");

-- CreateIndex
CREATE INDEX "github_links_projectId_idx" ON "github_links"("projectId");

-- CreateIndex
CREATE INDEX "notifications_userId_read_idx" ON "notifications"("userId", "read");

-- CreateIndex
CREATE INDEX "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "project_members_userId_idx" ON "project_members"("userId");

-- CreateIndex
CREATE INDEX "project_members_projectId_idx" ON "project_members"("projectId");

-- CreateIndex
CREATE INDEX "projects_ownerId_idx" ON "projects"("ownerId");

-- CreateIndex
CREATE INDEX "projects_updatedAt_idx" ON "projects"("updatedAt");

-- CreateIndex
CREATE INDEX "sprints_projectId_status_idx" ON "sprints"("projectId", "status");

-- CreateIndex
CREATE INDEX "tasks_projectId_idx" ON "tasks"("projectId");

-- CreateIndex
CREATE INDEX "tasks_projectId_status_idx" ON "tasks"("projectId", "status");

-- CreateIndex
CREATE INDEX "tasks_assigneeId_idx" ON "tasks"("assigneeId");

-- CreateIndex
CREATE INDEX "tasks_dueDate_idx" ON "tasks"("dueDate");

-- CreateIndex
CREATE INDEX "tasks_createdAt_idx" ON "tasks"("createdAt");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");
