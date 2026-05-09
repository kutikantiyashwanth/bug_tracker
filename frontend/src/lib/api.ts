import axios, { AxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// â”€â”€ In-memory request cache â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface CacheEntry { data: any; ts: number }
const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 120_000; // 2 minutes â€” longer TTL = fewer round trips

// Pending requests deduplication â€” prevents double-fetching same endpoint
const pending = new Map<string, Promise<any>>();

// â”€â”€ Axios instance â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000, // 20s â€” Render free tier cold starts can take 15s+
});

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
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
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// â”€â”€ Cached GET helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// Clear entire cache â€” call on login/logout so stale data never shows
export const clearAllCache = () => {
  cache.clear();
  pending.clear();
};

// â”€â”€ Backend keep-alive ping â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Render free tier sleeps after 15 min. Ping every 10 min to keep it warm.
// Only runs in browser, only when user is logged in.
let keepAliveInterval: ReturnType<typeof setInterval> | null = null;

export const startKeepAlive = () => {
  if (typeof window === 'undefined') return;
  if (keepAliveInterval) return; // already running
  keepAliveInterval = setInterval(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    // Fire-and-forget health check â€” don't await, don't show errors
    fetch(`${API_URL.replace('/api/v1', '')}/api/v1/health`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {}); // silently ignore failures
  }, 10 * 60 * 1000); // every 10 minutes
};

export const stopKeepAlive = () => {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
  }
};

// â”€â”€ Auth API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const authApi = {
  register: (data: { name: string; email: string; password: string; role: string; skills?: string[] }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// â”€â”€ Projects API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€ Tasks API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const tasksApi = {
  getAll: (projectId: string) => cachedGet(`/projects/${projectId}/tasks`),
  create: (data: any) => {
    invalidateCache(`/projects/${data.projectId}/tasks`);
    return api.post(`/projects/${data.projectId}/tasks`, data);
  },
  update: (id: string, data: any) => {
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

// â”€â”€ Bugs API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€ Activities API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const activitiesApi = {
  getAll: (projectId: string) => cachedGet(`/projects/${projectId}/activities`),
};

// â”€â”€ Analytics API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const analyticsApi = {
  get: (projectId: string) => cachedGet(`/projects/${projectId}/analytics`),
};

// â”€â”€ Notifications API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

