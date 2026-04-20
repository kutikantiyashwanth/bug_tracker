import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  User, Project, Task, Bug, ActivityLog, Notification,
  TaskStatus, Priority, Severity, BugStatus, Role, TimeEntry, ActiveTimer,
} from "./types";
import { generateId } from "./utils";

// ────────────────── SEED DATA ──────────────────
const seedUsers: User[] = [
  { id: "u1", name: "Alex Johnson", email: "alex@team.dev", role: "admin", skills: ["React", "Node.js", "TypeScript"], joinedAt: "2026-01-15T10:00:00Z" },
  { id: "u2", name: "Priya Sharma", email: "priya@team.dev", role: "developer", skills: ["Python", "Django", "PostgreSQL"], joinedAt: "2026-01-20T10:00:00Z" },
  { id: "u3", name: "Marcus Chen", email: "marcus@team.dev", role: "developer", skills: ["React", "GraphQL", "AWS"], joinedAt: "2026-02-01T10:00:00Z" },
  { id: "u4", name: "Sofia Rodriguez", email: "sofia@team.dev", role: "tester", skills: ["Selenium", "Cypress", "Jest"], joinedAt: "2026-02-10T10:00:00Z" },
  { id: "u5", name: "James Wilson", email: "james@team.dev", role: "developer", skills: ["Java", "Spring Boot", "Docker"], joinedAt: "2026-03-01T10:00:00Z" },
];

const seedProjects: Project[] = [
  {
    id: "p1", name: "Campus Connect", description: "A social networking platform for university students to collaborate on projects and share resources.",
    createdAt: "2026-01-15T10:00:00Z", updatedAt: "2026-04-17T10:00:00Z", ownerId: "u1", inviteCode: "CC-2026-XK9",
    members: [
      { userId: "u1", role: "admin", joinedAt: "2026-01-15T10:00:00Z" },
      { userId: "u2", role: "developer", joinedAt: "2026-01-20T10:00:00Z" },
      { userId: "u3", role: "developer", joinedAt: "2026-02-01T10:00:00Z" },
      { userId: "u4", role: "tester", joinedAt: "2026-02-10T10:00:00Z" },
    ],
  },
  {
    id: "p2", name: "EcoTrack", description: "An environmental impact tracking app that helps students monitor and reduce their carbon footprint.",
    createdAt: "2026-02-20T10:00:00Z", updatedAt: "2026-04-16T10:00:00Z", ownerId: "u2", inviteCode: "ET-2026-QM5",
    members: [
      { userId: "u2", role: "admin", joinedAt: "2026-02-20T10:00:00Z" },
      { userId: "u1", role: "developer", joinedAt: "2026-02-22T10:00:00Z" },
      { userId: "u5", role: "developer", joinedAt: "2026-03-01T10:00:00Z" },
    ],
  },
];

const seedTasks: Task[] = [
  { id: "t1", projectId: "p1", title: "Design user authentication flow", description: "Create wireframes and implement the login/signup UI with OAuth integration.", status: "done", priority: "high", assigneeId: "u1", createdBy: "u1", dueDate: "2026-02-01T10:00:00Z", createdAt: "2026-01-16T10:00:00Z", updatedAt: "2026-01-30T10:00:00Z", tags: ["frontend", "auth"] },
  { id: "t2", projectId: "p1", title: "Set up PostgreSQL database schema", description: "Design and implement the database schema for users, posts, and groups.", status: "done", priority: "critical", assigneeId: "u2", createdBy: "u1", dueDate: "2026-02-05T10:00:00Z", createdAt: "2026-01-16T10:00:00Z", updatedAt: "2026-02-03T10:00:00Z", tags: ["backend", "database"] },
  { id: "t3", projectId: "p1", title: "Implement real-time chat feature", description: "Build WebSocket-based real-time messaging between users using Socket.io.", status: "in-progress", priority: "high", assigneeId: "u3", createdBy: "u1", dueDate: "2026-04-25T10:00:00Z", createdAt: "2026-03-01T10:00:00Z", updatedAt: "2026-04-15T10:00:00Z", tags: ["backend", "real-time"] },
  { id: "t4", projectId: "p1", title: "Build notification system", description: "Create in-app and email notification system for task assignments and mentions.", status: "todo", priority: "medium", assigneeId: "u3", createdBy: "u1", dueDate: "2026-05-01T10:00:00Z", createdAt: "2026-03-15T10:00:00Z", updatedAt: "2026-03-15T10:00:00Z", tags: ["backend", "notifications"] },
  { id: "t5", projectId: "p1", title: "Create user profile page", description: "Design and implement the user profile page with skills, bio, and activity feed.", status: "testing", priority: "medium", assigneeId: "u1", createdBy: "u1", dueDate: "2026-04-20T10:00:00Z", createdAt: "2026-02-20T10:00:00Z", updatedAt: "2026-04-14T10:00:00Z", tags: ["frontend", "ui"] },
  { id: "t6", projectId: "p1", title: "Write API documentation", description: "Document all REST API endpoints using Swagger/OpenAPI specification.", status: "backlog", priority: "low", assigneeId: undefined, createdBy: "u1", dueDate: "2026-05-15T10:00:00Z", createdAt: "2026-04-01T10:00:00Z", updatedAt: "2026-04-01T10:00:00Z", tags: ["docs"] },
  { id: "t7", projectId: "p1", title: "Implement search functionality", description: "Add full-text search for users, posts, and projects with filtering.", status: "todo", priority: "high", assigneeId: "u2", createdBy: "u1", dueDate: "2026-04-28T10:00:00Z", createdAt: "2026-04-05T10:00:00Z", updatedAt: "2026-04-05T10:00:00Z", tags: ["backend", "search"] },
  { id: "t8", projectId: "p1", title: "Mobile responsive design audit", description: "Review and fix all pages for mobile responsiveness across devices.", status: "backlog", priority: "medium", assigneeId: "u4", createdBy: "u1", dueDate: "2026-05-10T10:00:00Z", createdAt: "2026-04-10T10:00:00Z", updatedAt: "2026-04-10T10:00:00Z", tags: ["frontend", "mobile"] },
  { id: "t9", projectId: "p2", title: "Design carbon calculator algorithm", description: "Research and implement the algorithm to calculate carbon footprint from daily activities.", status: "in-progress", priority: "critical", assigneeId: "u2", createdBy: "u2", dueDate: "2026-04-22T10:00:00Z", createdAt: "2026-02-25T10:00:00Z", updatedAt: "2026-04-16T10:00:00Z", tags: ["backend", "algorithm"] },
  { id: "t10", projectId: "p2", title: "Build dashboard charts", description: "Create interactive charts showing weekly/monthly carbon footprint trends.", status: "todo", priority: "high", assigneeId: "u5", createdBy: "u2", dueDate: "2026-04-30T10:00:00Z", createdAt: "2026-03-10T10:00:00Z", updatedAt: "2026-03-10T10:00:00Z", tags: ["frontend", "charts"] },
  { id: "t11", projectId: "p1", title: "Set up CI/CD pipeline", description: "Configure GitHub Actions for automated testing and deployment.", status: "in-progress", priority: "medium", assigneeId: "u5", createdBy: "u1", dueDate: "2026-04-24T10:00:00Z", createdAt: "2026-04-12T10:00:00Z", updatedAt: "2026-04-17T10:00:00Z", tags: ["devops"] },
  { id: "t12", projectId: "p1", title: "Implement file upload system", description: "Build file upload with drag-and-drop, preview, and cloud storage integration.", status: "todo", priority: "medium", assigneeId: "u3", createdBy: "u1", dueDate: "2026-05-05T10:00:00Z", createdAt: "2026-04-15T10:00:00Z", updatedAt: "2026-04-15T10:00:00Z", tags: ["backend", "storage"] },
];

const seedBugs: Bug[] = [
  { id: "b1", projectId: "p1", title: "Login button unresponsive on Safari", description: "The login button does not respond to clicks on Safari 17.x browsers. Users cannot authenticate.", stepsToReproduce: "1. Open Safari 17\n2. Navigate to login page\n3. Enter valid credentials\n4. Click Login button\n5. Nothing happens", severity: "critical", status: "open", assigneeId: "u1", reportedBy: "u4", createdAt: "2026-04-15T09:00:00Z", updatedAt: "2026-04-15T09:00:00Z" },
  { id: "b2", projectId: "p1", title: "Profile image not displaying correctly", description: "Uploaded profile images appear pixelated on the profile page when dimensions exceed 500x500.", stepsToReproduce: "1. Go to Settings\n2. Upload image larger than 500x500\n3. Save profile\n4. View profile page", severity: "minor", status: "in-progress", assigneeId: "u3", reportedBy: "u4", createdAt: "2026-04-14T14:00:00Z", updatedAt: "2026-04-16T10:00:00Z" },
  { id: "b3", projectId: "p1", title: "Chat messages duplicated on reconnection", description: "When WebSocket reconnects after network interruption, the last 5 messages appear duplicated.", stepsToReproduce: "1. Open chat\n2. Send a few messages\n3. Disable WiFi for 5 seconds\n4. Re-enable WiFi\n5. Observe duplicate messages", severity: "major", status: "open", assigneeId: "u3", reportedBy: "u1", createdAt: "2026-04-16T11:00:00Z", updatedAt: "2026-04-16T11:00:00Z" },
  { id: "b4", projectId: "p1", title: "Missing validation on email field", description: "Registration form accepts invalid email formats without showing an error.", stepsToReproduce: "1. Go to registration page\n2. Enter 'notanemail' in email field\n3. Fill other fields\n4. Submit form\n5. Form submits without validation error", severity: "major", status: "resolved", assigneeId: "u1", reportedBy: "u4", createdAt: "2026-04-10T08:00:00Z", updatedAt: "2026-04-13T16:00:00Z" },
  { id: "b5", projectId: "p2", title: "Carbon calculation returns NaN for edge cases", description: "When user inputs 0 for transportation distance, the calculation returns NaN.", stepsToReproduce: "1. Open carbon calculator\n2. Set transportation to 'Car'\n3. Set distance to 0\n4. Click Calculate\n5. Result shows NaN", severity: "critical", status: "open", assigneeId: "u2", reportedBy: "u5", createdAt: "2026-04-17T13:00:00Z", updatedAt: "2026-04-17T13:00:00Z" },
];

const seedActivities: ActivityLog[] = [
  { id: "a1", projectId: "p1", userId: "u1", action: "created", entityType: "task", entityId: "t12", details: "Created task 'Implement file upload system'", createdAt: "2026-04-15T10:00:00Z" },
  { id: "a2", projectId: "p1", userId: "u3", action: "moved", entityType: "task", entityId: "t3", details: "Moved 'Implement real-time chat feature' to In Progress", createdAt: "2026-04-15T11:30:00Z" },
  { id: "a3", projectId: "p1", userId: "u4", action: "reported", entityType: "bug", entityId: "b1", details: "Reported bug 'Login button unresponsive on Safari'", createdAt: "2026-04-15T09:00:00Z" },
  { id: "a4", projectId: "p1", userId: "u1", action: "resolved", entityType: "bug", entityId: "b4", details: "Resolved bug 'Missing validation on email field'", createdAt: "2026-04-13T16:00:00Z" },
  { id: "a5", projectId: "p1", userId: "u5", action: "joined", entityType: "member", entityId: "u5", details: "James Wilson joined the project", createdAt: "2026-03-01T10:00:00Z" },
  { id: "a6", projectId: "p1", userId: "u1", action: "moved", entityType: "task", entityId: "t5", details: "Moved 'Create user profile page' to Testing", createdAt: "2026-04-14T14:00:00Z" },
  { id: "a7", projectId: "p2", userId: "u5", action: "reported", entityType: "bug", entityId: "b5", details: "Reported bug 'Carbon calculation returns NaN'", createdAt: "2026-04-17T13:00:00Z" },
  { id: "a8", projectId: "p1", userId: "u3", action: "assigned", entityType: "bug", entityId: "b2", details: "Assigned to 'Profile image not displaying correctly'", createdAt: "2026-04-16T10:00:00Z" },
  { id: "a9", projectId: "p1", userId: "u1", action: "created", entityType: "task", entityId: "t11", details: "Created task 'Set up CI/CD pipeline'", createdAt: "2026-04-12T10:00:00Z" },
  { id: "a10", projectId: "p2", userId: "u2", action: "moved", entityType: "task", entityId: "t9", details: "Moved 'Design carbon calculator algorithm' to In Progress", createdAt: "2026-04-16T10:00:00Z" },
];

const seedNotifications: Notification[] = [
  { id: "n1", userId: "u1", type: "bug_assigned", title: "Bug Assigned", message: "You've been assigned to 'Login button unresponsive on Safari'", read: false, createdAt: "2026-04-15T09:05:00Z", link: "/dashboard/bugs" },
  { id: "n2", userId: "u1", type: "deadline_reminder", title: "Deadline Approaching", message: "'Create user profile page' is due in 2 days", read: false, createdAt: "2026-04-18T08:00:00Z", link: "/dashboard/kanban" },
  { id: "n3", userId: "u1", type: "task_moved", title: "Task Updated", message: "Marcus moved 'Real-time chat' to In Progress", read: true, createdAt: "2026-04-15T11:30:00Z", link: "/dashboard/kanban" },
  { id: "n4", userId: "u1", type: "bug_resolved", title: "Bug Resolved", message: "'Missing validation on email field' has been resolved", read: true, createdAt: "2026-04-13T16:05:00Z", link: "/dashboard/bugs" },
  { id: "n5", userId: "u1", type: "project_invite", title: "Project Invitation", message: "You've been invited to join 'StudyMate AI'", read: false, createdAt: "2026-04-17T14:00:00Z" },
];

// ────────────────── STORE ──────────────────
interface AppState {
  // Auth
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string, role: Role) => boolean;
  logout: () => void;

  // Project
  projects: Project[];
  activeProjectId: string | null;
  setActiveProject: (id: string) => void;
  createProject: (name: string, description: string) => void;
  joinProject: (inviteCode: string) => boolean;
  getActiveProject: () => Project | undefined;

  // Tasks
  tasks: Task[];
  createTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  moveTask: (id: string, status: TaskStatus) => void;
  deleteTask: (id: string) => void;
  getProjectTasks: (projectId?: string) => Task[];

  // Bugs
  bugs: Bug[];
  createBug: (bug: Omit<Bug, "id" | "createdAt" | "updatedAt">) => void;
  updateBug: (id: string, updates: Partial<Bug>) => void;
  deleteBug: (id: string) => void;
  getProjectBugs: (projectId?: string) => Bug[];

  // Activity
  activities: ActivityLog[];
  addActivity: (activity: Omit<ActivityLog, "id" | "createdAt">) => void;
  getProjectActivities: (projectId?: string) => ActivityLog[];

  // Notifications
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  getUnreadCount: () => number;

  // Users
  users: User[];
  getUserById: (id: string) => User | undefined;

  // Time Tracking
  timeEntries: TimeEntry[];
  activeTimer: ActiveTimer | null;
  startTimer: (taskId?: string, bugId?: string, description?: string) => void;
  stopTimer: () => void;
  logTime: (entry: Omit<TimeEntry, "id" | "createdAt">) => void;
  getTaskTime: (taskId: string) => number;
  getBugTime: (bugId: string) => number;
  getUserTime: (userId: string, projectId?: string) => number;
  getProjectTime: (projectId?: string) => number;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ─── Auth ───
      currentUser: null,
      isAuthenticated: false,
      login: (email: string, _password: string) => {
        // Demo user gets seed data
        if (email === "alex@team.dev") {
          const user = seedUsers.find((u) => u.email === email);
          if (user) {
            set({ 
              currentUser: user, 
              isAuthenticated: true,
              users: seedUsers,
              projects: seedProjects,
              activeProjectId: "p1",
              tasks: seedTasks,
              bugs: seedBugs,
              activities: seedActivities,
              notifications: seedNotifications,
            });
            return true;
          }
        }
        // Regular users login with their own data
        const user = get().users.find((u) => u.email === email);
        if (user) {
          set({ currentUser: user, isAuthenticated: true });
          return true;
        }
        return false;
      },
      register: (name: string, email: string, _password: string, role: Role) => {
        const exists = get().users.find((u) => u.email === email);
        if (exists) return false;
        const newUser: User = {
          id: generateId(),
          name,
          email,
          role,
          skills: [],
          joinedAt: new Date().toISOString(),
        };
        // Clear all seed data for new users - they start fresh
        set({
          users: [newUser],
          currentUser: newUser,
          isAuthenticated: true,
          projects: [],
          activeProjectId: null,
          tasks: [],
          bugs: [],
          activities: [],
          notifications: [],
        });
        return true;
      },
      logout: () => set({ currentUser: null, isAuthenticated: false }),

      // ─── Projects ───
      projects: [],
      activeProjectId: null,
      setActiveProject: (id) => set({ activeProjectId: id }),
      createProject: (name, description) => {
        const user = get().currentUser;
        if (!user) return;
        const project: Project = {
          id: generateId(),
          name,
          description,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ownerId: user.id,
          inviteCode: `${name.substring(0, 2).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
          members: [{ userId: user.id, role: "admin", joinedAt: new Date().toISOString() }],
        };
        set((s) => ({ projects: [...s.projects, project], activeProjectId: project.id }));
      },
      joinProject: (inviteCode: string) => {
        const user = get().currentUser;
        if (!user) return false;
        
        const project = get().projects.find((p) => p.inviteCode === inviteCode);
        if (!project) return false;
        
        // Check if user is already a member
        const isMember = project.members.some((m) => m.userId === user.id);
        if (isMember) {
          set({ activeProjectId: project.id });
          return true;
        }
        
        // Add user to project
        const updatedProject = {
          ...project,
          members: [
            ...project.members,
            { userId: user.id, role: user.role, joinedAt: new Date().toISOString() }
          ],
          updatedAt: new Date().toISOString(),
        };
        
        set((s) => ({
          projects: s.projects.map((p) => p.id === project.id ? updatedProject : p),
          activeProjectId: project.id,
        }));
        
        // Add activity log
        get().addActivity({
          projectId: project.id,
          userId: user.id,
          action: "joined",
          entityType: "member",
          entityId: user.id,
          details: `${user.name} joined the project`,
        });
        
        return true;
      },
      getActiveProject: () => {
        const s = get();
        return s.projects.find((p) => p.id === s.activeProjectId);
      },

      // ─── Tasks ───
      tasks: [],
      createTask: (task) => {
        const newTask: Task = {
          ...task,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((s) => ({ tasks: [...s.tasks, newTask] }));
        get().addActivity({
          projectId: task.projectId,
          userId: task.createdBy,
          action: "created",
          entityType: "task",
          entityId: newTask.id,
          details: `Created task '${task.title}'`,
        });
      },
      updateTask: (id, updates) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
          ),
        })),
      moveTask: (id, status) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return;
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t
          ),
        }));
        const statusLabels: Record<TaskStatus, string> = {
          backlog: "Backlog",
          todo: "To Do",
          "in-progress": "In Progress",
          testing: "Testing",
          done: "Done",
        };
        get().addActivity({
          projectId: task.projectId,
          userId: get().currentUser?.id || task.createdBy,
          action: "moved",
          entityType: "task",
          entityId: id,
          details: `Moved '${task.title}' to ${statusLabels[status]}`,
        });
      },
      deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
      getProjectTasks: (projectId) => {
        const s = get();
        const pid = projectId || s.activeProjectId;
        return s.tasks.filter((t) => t.projectId === pid);
      },

      // ─── Bugs ───
      bugs: [],
      createBug: (bug) => {
        const newBug: Bug = {
          ...bug,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((s) => ({ bugs: [...s.bugs, newBug] }));
        get().addActivity({
          projectId: bug.projectId,
          userId: bug.reportedBy,
          action: "reported",
          entityType: "bug",
          entityId: newBug.id,
          details: `Reported bug '${bug.title}'`,
        });
      },
      updateBug: (id, updates) =>
        set((s) => ({
          bugs: s.bugs.map((b) =>
            b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
          ),
        })),
      deleteBug: (id) => set((s) => ({ bugs: s.bugs.filter((b) => b.id !== id) })),
      getProjectBugs: (projectId) => {
        const s = get();
        const pid = projectId || s.activeProjectId;
        return s.bugs.filter((b) => b.projectId === pid);
      },

      // ─── Activity ───
      activities: [],
      addActivity: (activity) => {
        const newActivity: ActivityLog = {
          ...activity,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ activities: [newActivity, ...s.activities] }));
      },
      getProjectActivities: (projectId) => {
        const s = get();
        const pid = projectId || s.activeProjectId;
        return s.activities
          .filter((a) => a.projectId === pid)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      // ─── Notifications ───
      notifications: [],
      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
      markAllNotificationsRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),
      getUnreadCount: () => get().notifications.filter((n) => !n.read).length,

      // ─── Users ───
      users: [],
      getUserById: (id) => get().users.find((u) => u.id === id),

      // ─── Time Tracking ───
      timeEntries: [],
      activeTimer: null,
      startTimer: (taskId?: string, bugId?: string, description?: string) => {
        const user = get().currentUser;
        if (!user) return;
        set({
          activeTimer: {
            taskId,
            bugId,
            startTime: new Date().toISOString(),
            description: description || "",
          },
        });
      },
      stopTimer: () => {
        const timer = get().activeTimer;
        const user = get().currentUser;
        const projectId = get().activeProjectId;
        if (!timer || !user || !projectId) return;

        const startTime = new Date(timer.startTime);
        const endTime = new Date();
        const diffMs = endTime.getTime() - startTime.getTime();
        const totalMinutes = Math.floor(diffMs / 60000);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        get().logTime({
          projectId,
          taskId: timer.taskId,
          bugId: timer.bugId,
          userId: user.id,
          hours,
          minutes,
          description: timer.description,
          billable: false,
          date: new Date().toISOString().split("T")[0],
        });

        set({ activeTimer: null });
      },
      logTime: (entry) => {
        const newEntry: TimeEntry = {
          ...entry,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ timeEntries: [...s.timeEntries, newEntry] }));
      },
      getTaskTime: (taskId) => {
        const entries = get().timeEntries.filter((e) => e.taskId === taskId);
        return entries.reduce((total, e) => total + e.hours * 60 + e.minutes, 0);
      },
      getBugTime: (bugId) => {
        const entries = get().timeEntries.filter((e) => e.bugId === bugId);
        return entries.reduce((total, e) => total + e.hours * 60 + e.minutes, 0);
      },
      getUserTime: (userId, projectId) => {
        const pid = projectId || get().activeProjectId;
        const entries = get().timeEntries.filter(
          (e) => e.userId === userId && e.projectId === pid
        );
        return entries.reduce((total, e) => total + e.hours * 60 + e.minutes, 0);
      },
      getProjectTime: (projectId) => {
        const pid = projectId || get().activeProjectId;
        const entries = get().timeEntries.filter((e) => e.projectId === pid);
        return entries.reduce((total, e) => total + e.hours * 60 + e.minutes, 0);
      },
    }),
    {
      name: "student-bug-tracker-store",
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        projects: state.projects,
        activeProjectId: state.activeProjectId,
        tasks: state.tasks,
        bugs: state.bugs,
        activities: state.activities,
        notifications: state.notifications,
        users: state.users,
        timeEntries: state.timeEntries,
        activeTimer: state.activeTimer,
      }),
    }
  )
);
