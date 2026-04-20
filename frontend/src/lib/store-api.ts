import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  User, Project, Task, Bug, ActivityLog, Notification,
  TaskStatus, Priority, Severity, BugStatus, Role, TimeEntry, ActiveTimer,
} from "./types";
import { authApi, projectsApi, tasksApi, bugsApi, activitiesApi, notificationsApi, invalidateCache } from "./api";
import { getSocket, disconnectSocket } from "./socket";

// ── Normalize DB uppercase enums → frontend lowercase ──
const normalizeTask = (t: any): Task => ({
  ...t,
  status: (t.status || "BACKLOG").toLowerCase().replace("_", "-") as TaskStatus,
  priority: (t.priority || "MEDIUM").toLowerCase() as Priority,
  createdBy: t.createdById || t.createdBy || "",
  assigneeId: t.assigneeId || undefined,
});

const normalizeBug = (b: any): Bug => ({
  ...b,
  status: (b.status || "OPEN").toLowerCase().replace("_", "-") as BugStatus,
  severity: (b.severity || "MAJOR").toLowerCase() as Severity,
  reportedBy: b.reporterId || b.reportedBy || "",
  assigneeId: b.assigneeId || undefined,
});

const normalizeActivity = (a: any): ActivityLog => ({
  ...a,
  entityType: (a.entityType || "task").toLowerCase() as ActivityLog["entityType"],
});

const normalizeProject = (p: any): Project => ({
  ...p,
  members: (p.members || []).map((m: any) => ({
    userId: m.userId || m.user?.id,
    role: (m.role || "DEVELOPER").toLowerCase() as Role,
    joinedAt: m.joinedAt || m.createdAt,
    user: m.user,
  })),
});

// ────────────────── STORE WITH API ──────────────────
interface AppState {
  // Loading & Error States
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;

  // Auth
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: Role, skills?: string[]) => Promise<void>;
  logout: () => void;
  fetchCurrentUser: () => Promise<void>;

  // Project
  projects: Project[];
  activeProjectId: string | null;
  setActiveProject: (id: string) => void;
  fetchProjects: () => Promise<void>;
  createProject: (name: string, description: string) => Promise<void>;
  joinProject: (inviteCode: string) => Promise<boolean>;
  getActiveProject: () => Project | undefined;

  // Tasks
  tasks: Task[];
  fetchTasks: (projectId: string) => Promise<void>;
  createTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  moveTask: (id: string, status: TaskStatus) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getProjectTasks: (projectId?: string) => Task[];

  // Bugs
  bugs: Bug[];
  fetchBugs: (projectId: string) => Promise<void>;
  createBug: (bug: Omit<Bug, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateBug: (id: string, updates: Partial<Bug>) => Promise<void>;
  deleteBug: (id: string) => void;
  getProjectBugs: (projectId?: string) => Bug[];

  // Activity
  activities: ActivityLog[];
  fetchActivities: (projectId: string) => Promise<void>;
  getProjectActivities: (projectId?: string) => ActivityLog[];

  // Notifications
  notifications: Notification[];
  fetchNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  getUnreadCount: () => number;

  // Users
  users: User[];
  getUserById: (id: string) => User | undefined;

  // Socket / Real-time
  connectSocket: () => void;
  disconnectSocket: () => void;

  // Time Tracking (still local for now)
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
      // ─── Loading & Error ───
      isLoading: false,
      error: null,
      setError: (error) => set({ error }),

      // ─── Auth ───
      currentUser: null,
      isAuthenticated: false,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login({ email, password });
          // Handle both response shapes: { data: { user, token } } and { data: { data: { user, token } } }
          const payload = response.data?.data ?? response.data;
          const token = payload?.token;
          const user = payload?.user;

          if (!token || !user) {
            throw new Error('Invalid response from server');
          }

          localStorage.setItem('token', token);
          set({ 
            currentUser: user, 
            isAuthenticated: true, 
            isLoading: false,
            error: null,
          });
          // Fetch projects and notifications after login
          get().fetchProjects().catch(() => {});
          get().fetchNotifications().catch(() => {});
          // Connect real-time socket
          setTimeout(() => get().connectSocket(), 100);
        } catch (error: any) {
          const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Login failed';
          set({ error: errorMsg, isLoading: false, isAuthenticated: false, currentUser: null });
          throw new Error(errorMsg);
        }
      },

      register: async (name: string, email: string, password: string, role: Role, skills: string[] = []) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register({ name, email, password, role, skills });
          const { token, user } = response.data.data;
          localStorage.setItem('token', token);
          set({ 
            currentUser: user, 
            isAuthenticated: true, 
            isLoading: false,
            projects: [],
            tasks: [],
            bugs: [],
            activities: [],
          });
        } catch (error: any) {
          const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Registration failed';
          set({ error: errorMsg, isLoading: false });
          throw new Error(errorMsg);
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        // Also clear the persisted store so isAuthenticated doesn't survive a refresh
        localStorage.removeItem('student-bug-tracker-api-store');
        // Disconnect socket
        disconnectSocket();
        set({ 
          currentUser: null, 
          isAuthenticated: false,
          projects: [],
          tasks: [],
          bugs: [],
          activities: [],
          activeProjectId: null,
        });
      },

      fetchCurrentUser: async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
          const response = await authApi.getMe();
          const user = response.data?.data ?? response.data;
          if (user?.id) {
            set({ currentUser: user, isAuthenticated: true });
            // Re-connect socket on page refresh
            setTimeout(() => get().connectSocket(), 100);
          }
        } catch {
          localStorage.removeItem('token');
          set({ currentUser: null, isAuthenticated: false });
        }
      },

      // ─── Projects ───
      projects: [],
      activeProjectId: null,
      setActiveProject: (id) => {
        set({ activeProjectId: id });
        // Fetch tasks and bugs for this project
        if (id) {
          get().fetchTasks(id);
          get().fetchBugs(id);
          get().fetchActivities(id);
          // Switch socket room
          const token = localStorage.getItem('token');
          if (token) {
            const { getExistingSocket } = require('./socket');
            const sock = getExistingSocket();
            if (sock?.connected) {
              // Leave all project rooms then join new one
              sock.emit('join-project', id);
            }
          }
        }
      },

      fetchProjects: async () => {
        try {
          const response = await projectsApi.getAll();
          const projects = (response.data.data || response.data || []).map(normalizeProject);
          set({ projects });
          // Always set active project and reload its data
          const currentActiveId = get().activeProjectId;
          const targetId = projects.find(p => p.id === currentActiveId)?.id || projects[0]?.id;
          if (targetId) {
            set({ activeProjectId: targetId });
            // Always reload bugs, tasks, activities for the active project
            get().fetchTasks(targetId).catch(() => {});
            get().fetchBugs(targetId).catch(() => {});
            get().fetchActivities(targetId).catch(() => {});
          }
        } catch (error: any) {
          console.error('Failed to fetch projects:', error);
          set({ projects: [] });
        }
      },

      createProject: async (name: string, description: string) => {
        try {
          const response = await projectsApi.create({ name, description });
          const newProject = normalizeProject(response.data.data || response.data);
          set((state) => ({
            projects: [...state.projects, newProject],
            activeProjectId: newProject.id,
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.error || 'Failed to create project' });
          throw error;
        }
      },

      joinProject: async (inviteCode: string) => {
        try {
          const response = await projectsApi.join(inviteCode);
          const project = normalizeProject(response.data.data || response.data);
          set((state) => ({
            projects: [...state.projects, project],
            activeProjectId: project.id,
          }));
          return true;
        } catch (error: any) {
          set({ error: error.response?.data?.error || 'Failed to join project' });
          return false;
        }
      },

      getActiveProject: () => {
        const s = get();
        return s.projects.find((p) => p.id === s.activeProjectId);
      },

      // ─── Tasks ───
      tasks: [],
      
      fetchTasks: async (projectId: string) => {
        try {
          const response = await tasksApi.getAll(projectId);
          set({ tasks: (response.data.data || response.data || []).map(normalizeTask) });
        } catch (error: any) {
          console.error('Failed to fetch tasks:', error);
          set({ tasks: [] });
        }
      },

      createTask: async (task) => {
        try {
          const response = await tasksApi.create(task);
          const newTask = normalizeTask(response.data.data || response.data);
          set((state) => ({ tasks: [...state.tasks, newTask] }));
        } catch (error: any) {
          set({ error: error.response?.data?.error || 'Failed to create task' });
          throw error;
        }
      },

      updateTask: async (id: string, updates: Partial<Task>) => {
        // Optimistic update
        set((state) => ({
          tasks: state.tasks.map((t) => t.id === id ? { ...t, ...updates } : t),
        }));
        try {
          const response = await tasksApi.update(id, updates);
          const updatedTask = normalizeTask(response.data.data || response.data);
          set((state) => ({
            tasks: state.tasks.map((t) => t.id === id ? updatedTask : t),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.error || 'Failed to update task' });
          throw error;
        }
      },

      moveTask: async (id: string, status: TaskStatus) => {
        await get().updateTask(id, { status });
        // Broadcast to project room so other users see it instantly
        const { getExistingSocket } = require('./socket');
        const sock = getExistingSocket();
        const projectId = get().activeProjectId;
        if (sock?.connected && projectId) {
          sock.emit('task-moved', { projectId, taskId: id, status });
        }
      },

      deleteTask: async (id: string) => {
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
        try {
          await tasksApi.delete(id);
        } catch (error: any) {
          set({ error: error.response?.data?.error || 'Failed to delete task' });
          throw error;
        }
      },

      getProjectTasks: (projectId) => {
        const s = get();
        const pid = projectId || s.activeProjectId;
        return s.tasks.filter((t) => t.projectId === pid);
      },

      // ─── Bugs ───
      bugs: [],

      fetchBugs: async (projectId: string) => {
        try {
          const response = await bugsApi.getAll(projectId);
          set({ bugs: (response.data.data || response.data || []).map(normalizeBug) });
        } catch (error: any) {
          console.error('Failed to fetch bugs:', error);
          set({ bugs: [] });
        }
      },

      createBug: async (bug) => {
        try {
          const response = await bugsApi.create(bug);
          const newBug = normalizeBug(response.data.data || response.data);
          set((state) => ({ bugs: [...state.bugs, newBug] }));
          // Broadcast to project room
          const { getExistingSocket } = require('./socket');
          const sock = getExistingSocket();
          if (sock?.connected && bug.projectId) {
            sock.emit('bug-reported', { projectId: bug.projectId, bug: newBug });
          }
        } catch (error: any) {
          set({ error: error.response?.data?.error || 'Failed to create bug' });
          throw error;
        }
      },

      updateBug: async (id: string, updates: Partial<Bug>) => {
        set((state) => ({
          bugs: state.bugs.map((b) => b.id === id ? { ...b, ...updates } : b),
        }));
        try {
          const response = await bugsApi.update(id, updates);
          const updatedBug = normalizeBug(response.data.data || response.data);
          set((state) => ({
            bugs: state.bugs.map((b) => b.id === id ? updatedBug : b),
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.error || 'Failed to update bug' });
          throw error;
        }
      },

      deleteBug: (id) => set((s) => ({ bugs: s.bugs.filter((b) => b.id !== id) })),
      
      getProjectBugs: (projectId) => {
        const s = get();
        const pid = projectId || s.activeProjectId;
        return s.bugs.filter((b) => b.projectId === pid);
      },

      // ─── Activity ───
      activities: [],

      fetchActivities: async (projectId: string) => {
        try {
          const response = await activitiesApi.getAll(projectId);
          set({ activities: (response.data.data || response.data || []).map(normalizeActivity) });
        } catch (error: any) {
          console.error('Failed to fetch activities:', error);
          set({ activities: [] });
        }
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
      fetchNotifications: async () => {
        try {
          const response = await notificationsApi.getAll();
          const data = response.data?.data || response.data || [];
          const normalized = data.map((n: any) => ({
            ...n,
            type: (n.type || "").toLowerCase() as Notification["type"],
            read: Boolean(n.read),
          }));
          set({ notifications: normalized });
        } catch {
          // silently fail
        }
      },
      markNotificationRead: async (id) => {
        // Optimistic update
        set((s) => ({
          notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n),
        }));
        try { await notificationsApi.markRead(id); } catch {}
      },
      markAllNotificationsRead: async () => {
        // Optimistic update
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        }));
        try { await notificationsApi.markAllRead(); } catch {}
      },
      getUnreadCount: () => get().notifications.filter((n) => !n.read).length,

      // ─── Users ───
      users: [],
      getUserById: (id) => {
        // Check users array first
        const fromUsers = get().users.find((u) => u.id === id);
        if (fromUsers) return fromUsers;
        // Fall back to users embedded in project members
        for (const project of get().projects) {
          for (const member of project.members as any[]) {
            if (member.user && member.user.id === id) return member.user;
            if (member.userId === id && member.user) return member.user;
          }
        }
        return undefined;
      },

      // ─── Socket / Real-time ───
      connectSocket: () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const socket = getSocket(token);

        // Join personal notification room
        const userId = get().currentUser?.id;
        if (userId) socket.emit('join-user', userId);

        // Join active project room
        const projectId = get().activeProjectId;
        if (projectId) socket.emit('join-project', projectId);

        // ── Real-time event handlers ──

        // Task moved by another user → update store instantly
        socket.off('task-updated').on('task-updated', (data: { taskId: string; status: string }) => {
          set((s) => ({
            tasks: s.tasks.map((t) =>
              t.id === data.taskId
                ? { ...t, status: data.status.toLowerCase().replace('_', '-') as TaskStatus }
                : t
            ),
          }));
        });

        // New bug reported → prepend to store
        socket.off('new-bug').on('new-bug', (data: { bug: any }) => {
          if (!data.bug) return;
          const normalized = {
            ...data.bug,
            status: (data.bug.status || 'OPEN').toLowerCase().replace('_', '-') as BugStatus,
            severity: (data.bug.severity || 'MAJOR').toLowerCase() as Severity,
            reportedBy: data.bug.reporterId || data.bug.reportedBy || '',
          };
          set((s) => ({
            bugs: s.bugs.some((b) => b.id === normalized.id)
              ? s.bugs
              : [normalized, ...s.bugs],
          }));
        });

        // Notification pushed → prepend and invalidate cache
        socket.off('notification').on('notification', () => {
          invalidateCache('/notifications');
          get().fetchNotifications().catch(() => {});
        });
      },

      disconnectSocket: () => {
        disconnectSocket();
      },

      // ─── Time Tracking (Local for now) ───
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
          id: `te-${Date.now()}`,
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
      name: "student-bug-tracker-api-store",
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        activeProjectId: state.activeProjectId,
        timeEntries: state.timeEntries,
        activeTimer: state.activeTimer,
        // notifications now come from DB — not persisted locally
      }),
    }
  )
);
