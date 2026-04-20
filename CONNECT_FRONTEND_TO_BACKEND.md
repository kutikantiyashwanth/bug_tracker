# 🔗 Connect Frontend to Backend

## Current Status

**Frontend:** Uses localStorage (Zustand store)
**Backend:** PostgreSQL database ready
**Status:** ⚠️ Not connected yet

---

## 🎯 What Will Change

### Before (Current):
```
User → Frontend → localStorage (browser only)
```

### After (Connected):
```
User → Frontend → Backend API → PostgreSQL (persistent)
```

---

## ✅ Benefits of Connecting

### With Backend Connection:
- ✅ Data syncs across devices
- ✅ Real-time collaboration
- ✅ Secure authentication
- ✅ Data persists on server
- ✅ Multi-user support
- ✅ Backup and recovery
- ✅ Advanced features (email, etc.)

### Current (localStorage):
- ✅ Works offline
- ✅ Fast and simple
- ✅ No server needed
- ❌ Browser only
- ❌ No sync
- ❌ Can be cleared

---

## 🔧 Implementation Plan

### Files to Modify:

1. **Create API Client** (`frontend/src/lib/api.ts`)
   - HTTP client with axios/fetch
   - Authentication headers
   - Error handling

2. **Update Store** (`frontend/src/lib/store.ts`)
   - Replace localStorage calls with API calls
   - Add loading states
   - Handle errors

3. **Add Auth Context** (`frontend/src/lib/auth.ts`)
   - JWT token management
   - Login/logout functions
   - Protected routes

4. **Update Components**
   - Add loading spinners
   - Show error messages
   - Handle async operations

---

## 📝 Step-by-Step Implementation

### Step 1: Create API Client

Create `frontend/src/lib/api.ts`:

```typescript
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (data: { name: string; email: string; password: string; role: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Projects API
export const projectsApi = {
  getAll: () => api.get('/projects'),
  create: (data: { name: string; description: string }) =>
    api.post('/projects', data),
  join: (inviteCode: string) =>
    api.post('/projects/join', { inviteCode }),
};

// Tasks API
export const tasksApi = {
  getAll: (projectId: string) => api.get(`/tasks/${projectId}`),
  create: (data: any) => api.post('/tasks', data),
  update: (id: string, data: any) => api.put(`/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
};

// Bugs API
export const bugsApi = {
  getAll: (projectId: string) => api.get(`/bugs/${projectId}`),
  create: (data: any) => api.post('/bugs', data),
  update: (id: string, data: any) => api.put(`/bugs/${id}`, data),
};

// Activities API
export const activitiesApi = {
  getAll: (projectId: string) => api.get(`/activities/${projectId}`),
};
```

### Step 2: Update Environment Variables

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### Step 3: Update Store to Use API

Modify `frontend/src/lib/store.ts`:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, projectsApi, tasksApi, bugsApi } from './api';

interface AppState {
  // ... existing state
  isLoading: boolean;
  error: string | null;
  
  // Auth
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  
  // Projects
  fetchProjects: () => Promise<void>;
  createProject: (data: any) => Promise<void>;
  
  // Tasks
  fetchTasks: (projectId: string) => Promise<void>;
  createTask: (data: any) => Promise<void>;
  
  // ... other methods
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ... existing state
      isLoading: false,
      error: null,
      
      // Auth
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login({ email, password });
          const { token, user } = response.data.data;
          localStorage.setItem('token', token);
          set({ currentUser: user, isLoading: false });
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Login failed', isLoading: false });
          throw error;
        }
      },
      
      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register(data);
          const { token, user } = response.data.data;
          localStorage.setItem('token', token);
          set({ currentUser: user, isLoading: false });
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Registration failed', isLoading: false });
          throw error;
        }
      },
      
      logout: () => {
        localStorage.removeItem('token');
        set({ currentUser: null, projects: [], tasks: [], bugs: [] });
      },
      
      // Projects
      fetchProjects: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await projectsApi.getAll();
          set({ projects: response.data.data, isLoading: false });
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to fetch projects', isLoading: false });
        }
      },
      
      createProject: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await projectsApi.create(data);
          const newProject = response.data.data;
          set((state) => ({
            projects: [...state.projects, newProject],
            isLoading: false,
          }));
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to create project', isLoading: false });
          throw error;
        }
      },
      
      // ... implement other methods similarly
    }),
    {
      name: 'bug-tracker-storage',
      partialize: (state) => ({
        // Only persist user preferences, not data
        currentUser: state.currentUser,
      }),
    }
  )
);
```

### Step 4: Update Login Page

Modify `frontend/src/app/login/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (error) {
      // Error is handled in store
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### Step 5: Add Protected Routes

Create `frontend/src/components/ProtectedRoute.tsx`:

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { currentUser } = useStore();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !currentUser) {
      router.push('/login');
    }
  }, [currentUser, router]);

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}
```

### Step 6: Update Dashboard Layout

Wrap dashboard with protected route:

```typescript
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      {/* existing layout */}
      {children}
    </ProtectedRoute>
  );
}
```

---

## 🧪 Testing the Connection

### 1. Test Registration:
```typescript
// Should create user in database
await register({
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
  role: 'developer'
});
```

### 2. Test Login:
```typescript
// Should return JWT token
await login('test@example.com', 'password123');
```

### 3. Test Projects:
```typescript
// Should fetch from database
await fetchProjects();
```

### 4. Verify in Database:
```sql
SELECT * FROM users;
SELECT * FROM projects;
```

---

## 🔄 Migration Strategy

### Option 1: Clean Start (Recommended)
- Users create new accounts
- Start fresh with backend
- No data migration needed

### Option 2: Migrate Data
- Export localStorage data
- Import to database via API
- More complex but preserves data

### Option 3: Hybrid Mode
- Keep localStorage as fallback
- Sync to backend when online
- Offline-first approach

---

## ⚠️ Important Considerations

### Security:
- ✅ JWT tokens for auth
- ✅ HTTPS in production
- ✅ Password hashing (bcrypt)
- ✅ CORS configured
- ✅ Input validation

### Performance:
- Add loading states
- Implement caching
- Optimize API calls
- Add pagination

### Error Handling:
- Network errors
- Auth errors (401)
- Validation errors (400)
- Server errors (500)

### User Experience:
- Loading spinners
- Error messages
- Offline detection
- Retry logic

---

## 🚀 Deployment

### Frontend (Vercel):
```bash
# Add environment variable
NEXT_PUBLIC_API_URL=https://your-backend.com/api/v1

# Deploy
vercel deploy
```

### Backend (Railway/Render):
```bash
# Set environment variables
DATABASE_URL=your-postgres-url
JWT_SECRET=your-secret-key

# Deploy
git push
```

---

## 📊 Comparison

| Feature | localStorage | Backend API |
|---------|-------------|-------------|
| Setup | ✅ Easy | ⚠️ Complex |
| Speed | ✅ Fast | ⚠️ Network delay |
| Offline | ✅ Works | ❌ Needs connection |
| Multi-device | ❌ No | ✅ Yes |
| Collaboration | ❌ No | ✅ Yes |
| Data limit | ⚠️ 5-10MB | ✅ Unlimited |
| Security | ⚠️ Client-side | ✅ Server-side |
| Backup | ❌ No | ✅ Yes |

---

## 🎯 Recommendation

### For Students/Learning:
**Keep localStorage** - It works perfectly for demos and learning!

### For Production:
**Connect to backend** - Better for real-world use and collaboration.

### For Portfolio:
**Show both** - Demonstrate you can do both approaches!

---

## 📝 Summary

**Current:** Frontend works great with localStorage
**Backend:** Ready and waiting with PostgreSQL
**Connection:** Optional - implement when needed
**Benefit:** Learn both approaches!

---

**Want me to implement the connection? Just ask!** 🚀
