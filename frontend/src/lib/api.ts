import axios, { AxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// ── In-memory request cache (stale-while-revalidate pattern) ──────────────
interface CacheEntry { data: any; ts: number }
const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 30_000; // 30 seconds — data is "fresh" for 30s

// Pending requests deduplication — prevents double-fetching same endpoint
const pending = new Map<string, Promise<any>>();

// ── Axios instance ────────────────────────────────────────────────────────
export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  // Aggressive timeout — fail fast rather than hang
  timeout: 8000,
});

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally (except auth endpoints)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');
    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('token');
      if (typeof window !== 'undefined') window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Cached GET helper ─────────────────────────────────────────────────────
// Deduplicates in-flight requests and serves cached responses within TTL.
export const cachedGet = async (url: string, config?: AxiosRequestConfig): Promise<any> => {
  const key = url;

  // Serve from cache if fresh
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  // Deduplicate: if same request is already in-flight, wait for it
  if (pending.has(key)) return pending.get(key);

  const req = api.get(url, config).then((res) => {
    cache.set(key, { data: res, ts: Date.now() });
    pending.delete(key);
    return res;
  }).catch((err) => {
    pending.delete(key);
    throw err;
  });

  pending.set(key, req);
  return req;
};

// Invalidate cache for a URL prefix (call after mutations)
export const invalidateCache = (prefix: string) => {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
};

// ── Auth API ──────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { name: string; email: string; password: string; role: string; skills?: string[] }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// ── Projects API ──────────────────────────────────────────────────────────
export const projectsApi = {
  getAll: () => cachedGet('/projects'),
  create: (data: { name: string; description: string }) => {
    invalidateCache('/projects');
    return api.post('/projects', data);
  },
  join: (inviteCode: string) => {
    invalidateCache('/projects');
    return api.post('/projects/join', { inviteCode });
  },
};

// ── Tasks API ─────────────────────────────────────────────────────────────
export const tasksApi = {
  getAll: (projectId: string) => cachedGet(`/projects/${projectId}/tasks`),
  create: (data: any) => {
    invalidateCache(`/projects/${data.projectId}/tasks`);
    return api.post(`/projects/${data.projectId}/tasks`, data);
  },
  update: (id: string, data: any) => {
    // Invalidate tasks for all projects (we don't know which project here)
    for (const key of cache.keys()) {
      if (key.includes('/tasks')) cache.delete(key);
    }
    return api.patch(`/tasks/${id}`, data);
  },
  delete: (id: string) => {
    for (const key of cache.keys()) {
      if (key.includes('/tasks')) cache.delete(key);
    }
    return api.delete(`/tasks/${id}`);
  },
};

// ── Bugs API ──────────────────────────────────────────────────────────────
export const bugsApi = {
  getAll: (projectId: string) => cachedGet(`/projects/${projectId}/bugs`),
  create: (data: any) => {
    invalidateCache(`/projects/${data.projectId}/bugs`);
    return api.post(`/projects/${data.projectId}/bugs`, data);
  },
  update: (id: string, data: any) => {
    for (const key of cache.keys()) {
      if (key.includes('/bugs')) cache.delete(key);
    }
    return api.patch(`/bugs/${id}`, data);
  },
};

// ── Activities API ────────────────────────────────────────────────────────
export const activitiesApi = {
  getAll: (projectId: string) => cachedGet(`/projects/${projectId}/activities`),
};

// ── Analytics API ─────────────────────────────────────────────────────────
export const analyticsApi = {
  get: (projectId: string) => cachedGet(`/projects/${projectId}/analytics`),
};

// ── Notifications API ─────────────────────────────────────────────────────
export const notificationsApi = {
  getAll: () => cachedGet('/notifications'),
  markRead: (id: string) => {
    invalidateCache('/notifications');
    return api.patch(`/notifications/${id}/read`);
  },
  markAllRead: () => {
    invalidateCache('/notifications');
    return api.patch('/notifications/read-all');
  },
};
