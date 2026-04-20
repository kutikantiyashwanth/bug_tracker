import { create } from 'zustand';

export interface Bug {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  severity: string;
  projectId: string;
  reporter: { id: string; name: string; username: string; avatarUrl?: string };
  assignee?: { id: string; name: string; username: string; avatarUrl?: string };
  labels: Array<{ label: { id: string; name: string; color: string } }>;
  _count: { comments: number; attachments: number };
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  stepsToRepro?: string;
  environment?: string;
  version?: string;
}

export interface BugFilters {
  status?: string;
  priority?: string;
  severity?: string;
  search?: string;
  assigneeId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface BugStore {
  bugs: Bug[];
  selectedBug: Bug | null;
  filters: BugFilters;
  isLoading: boolean;
  pagination: { page: number; limit: number; total: number; totalPages: number };
  setBugs: (bugs: Bug[]) => void;
  addBug: (bug: Bug) => void;
  updateBug: (id: string, updates: Partial<Bug>) => void;
  removeBug: (id: string) => void;
  setSelectedBug: (bug: Bug | null) => void;
  setFilters: (filters: Partial<BugFilters>) => void;
  clearFilters: () => void;
  setLoading: (loading: boolean) => void;
  setPagination: (pagination: BugStore['pagination']) => void;
}

export const useBugStore = create<BugStore>((set) => ({
  bugs: [],
  selectedBug: null,
  filters: {},
  isLoading: false,
  pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
  setBugs: (bugs) => set({ bugs }),
  addBug: (bug) => set((s) => ({ bugs: [bug, ...s.bugs] })),
  updateBug: (id, updates) => set((s) => ({
    bugs: s.bugs.map((b) => b.id === id ? { ...b, ...updates } : b),
    selectedBug: s.selectedBug?.id === id ? { ...s.selectedBug, ...updates } : s.selectedBug,
  })),
  removeBug: (id) => set((s) => ({ bugs: s.bugs.filter((b) => b.id !== id) })),
  setSelectedBug: (bug) => set({ selectedBug: bug }),
  setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),
  clearFilters: () => set({ filters: {} }),
  setLoading: (isLoading) => set({ isLoading }),
  setPagination: (pagination) => set({ pagination }),
}));
