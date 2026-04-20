export type Role = "admin" | "developer" | "tester";
export type Priority = "low" | "medium" | "high" | "critical";
export type Severity = "minor" | "major" | "critical";
export type TaskStatus = "backlog" | "todo" | "in-progress" | "testing" | "done";
export type BugStatus = "open" | "in-progress" | "resolved" | "closed";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: Role;
  skills: string[];
  joinedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  inviteCode: string;
  members: ProjectMember[];
}

export interface ProjectMember {
  userId: string;
  role: Role;
  joinedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId?: string;
  createdBy: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface Bug {
  id: string;
  projectId: string;
  title: string;
  description: string;
  stepsToReproduce: string;
  severity: Severity;
  status: BugStatus;
  assigneeId?: string;
  reportedBy: string;
  screenshotUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  projectId: string;
  userId: string;
  action: string;
  entityType: "task" | "bug" | "project" | "member";
  entityId: string;
  details: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: "task_assigned" | "deadline_reminder" | "bug_assigned" | "project_invite" | "task_moved" | "bug_resolved";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface TimeEntry {
  id: string;
  projectId: string;
  taskId?: string;
  bugId?: string;
  userId: string;
  hours: number;
  minutes: number;
  description: string;
  billable: boolean;
  date: string;
  createdAt: string;
}

export interface ActiveTimer {
  taskId?: string;
  bugId?: string;
  startTime: string;
  description: string;
}

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  openBugs: number;
  fixedBugs: number;
  totalMembers: number;
  upcomingDeadlines: Task[];
  recentActivity: ActivityLog[];
  tasksByStatus: Record<TaskStatus, number>;
  bugsBySeverity: Record<Severity, number>;
  weeklyProgress: { day: string; completed: number; created: number }[];
}
