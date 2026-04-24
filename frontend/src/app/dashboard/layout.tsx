"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store-api";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DeadlineAlert } from "@/components/DeadlineAlert";
import { cn, getInitials } from "@/lib/utils";
import { can, normalizeRole } from "@/lib/rbac";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bug, LayoutDashboard, Kanban, AlertTriangle, Activity,
  Bell, Settings, LogOut, FolderOpen, ChevronDown,
  Plus, Menu, X, Copy, Check, Clock, Search,
  Shield, Code2, TestTube2, FolderKanban, BarChart3,
  Github, Layers,
} from "lucide-react";

const iconMap: Record<string, any> = {
  LayoutDashboard, Kanban, AlertTriangle, Activity,
  Bell, Settings, FolderOpen, Clock, BarChart3,
  Github, Layers,
};

const roleMeta: Record<string, { label: string; icon: any; gradient: string; text: string }> = {
  admin:     { label: "Admin",     icon: Shield,    gradient: "from-violet-500 to-purple-600", text: "text-violet-600" },
  developer: { label: "Developer", icon: Code2,     gradient: "from-blue-500 to-cyan-500",    text: "text-blue-600" },
  tester:    { label: "Tester",    icon: TestTube2, gradient: "from-amber-500 to-orange-500", text: "text-amber-600" },
};

const allNavGroups = [
  {
    label: "Workspace",
    items: [
      { href: "/dashboard",          label: "Overview",     iconKey: "LayoutDashboard", roles: ["admin","developer","tester"] },
      { href: "/dashboard/kanban",   label: "Kanban Board", iconKey: "Kanban",          roles: ["admin","developer"] },
      { href: "/dashboard/bugs",     label: "Bug Reports",  iconKey: "AlertTriangle",   roles: ["admin","developer","tester"] },
      { href: "/dashboard/projects", label: "Projects",     iconKey: "FolderOpen",      roles: ["admin","developer","tester"] },
    ],
  },
  {
    label: "Insights",
    items: [
      { href: "/dashboard/analytics",     label: "Analytics",     iconKey: "BarChart3", roles: ["admin","developer","tester"] },
      { href: "/dashboard/activity",      label: "Activity Log",  iconKey: "Activity",  roles: ["admin","developer","tester"] },
      { href: "/dashboard/time-tracking", label: "Time Tracking", iconKey: "Clock",     roles: ["admin","developer"] },
      { href: "/dashboard/notifications", label: "Notifications", iconKey: "Bell",      roles: ["admin","developer","tester"] },
    ],
  },
  {
    label: "Integrations",
    items: [
      { href: "/dashboard/github",  label: "GitHub",         iconKey: "Github", roles: ["admin","developer"] },
      { href: "/dashboard/sprints", label: "Sprint Planning", iconKey: "Layers", roles: ["admin","developer"] },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/dashboard/settings", label: "Settings", iconKey: "Settings", roles: ["admin","developer","tester"] },
    ],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute><DashboardLayoutContent>{children}</DashboardLayoutContent></ProtectedRoute>;
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { currentUser, isAuthenticated, logout, projects, activeProjectId, setActiveProject,
    notifications, fetchProjects, getUserById, fetchNotifications } = useStore();

  const [sidebarOpen,     setSidebarOpen]     = useState(false);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [copied,          setCopied]          = useState(false);
  const [searchOpen,      setSearchOpen]      = useState(false);
  const [searchQuery,     setSearchQuery]     = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  // Open search with ⌘K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 50);
    else setSearchQuery("");
  }, [searchOpen]);

  const userRole    = normalizeRole(currentUser?.role || "developer");
  const permissions = can(userRole);
  const meta        = roleMeta[userRole] || roleMeta.developer;

  const navGroups = allNavGroups.map((g) => ({
    ...g,
    items: g.items.filter((i) => i.roles.includes(userRole)),
  })).filter((g) => g.items.length > 0);

  const activeProject = Array.isArray(projects) ? projects.find((p) => p.id === activeProjectId) : undefined;
  const unreadCount   = Array.isArray(notifications) ? notifications.filter((n) => !n.read).length : 0;
  const currentLabel  = allNavGroups.flatMap((g) => g.items).find((i) => i.href === pathname)?.label || "Dashboard";

  // Search results
  const { tasks, bugs } = useStore();
  const searchResults = searchQuery.trim().length < 2 ? [] : (() => {
    const q = searchQuery.toLowerCase();
    const results: { type: string; label: string; sub: string; href: string; icon: any; color: string }[] = [];
    // Tasks
    (Array.isArray(tasks) ? tasks : []).filter((t) => t.projectId === activeProjectId)
      .filter((t) => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q))
      .slice(0, 3).forEach((t) => results.push({
        type: "Task", label: t.title, sub: t.status, href: "/dashboard/kanban",
        icon: Kanban, color: "text-violet-600",
      }));
    // Bugs
    (Array.isArray(bugs) ? bugs : []).filter((b) => b.projectId === activeProjectId)
      .filter((b) => b.title.toLowerCase().includes(q) || b.description?.toLowerCase().includes(q))
      .slice(0, 3).forEach((b) => results.push({
        type: "Bug", label: b.title, sub: b.severity, href: "/dashboard/bugs",
        icon: Bug, color: "text-red-600",
      }));
    // Projects
    (Array.isArray(projects) ? projects : [])
      .filter((p) => p.name.toLowerCase().includes(q))
      .slice(0, 2).forEach((p) => results.push({
        type: "Project", label: p.name, sub: `${p.members?.length || 0} members`, href: "/dashboard/projects",
        icon: FolderKanban, color: "text-blue-600",
      }));
    return results;
  })();

  useEffect(() => {
    if (isAuthenticated && currentUser?.id) {
      fetchProjects();
      fetchNotifications();
    }
  }, [isAuthenticated, currentUser?.id]);

  const handleCopyInvite = () => {
    if (!activeProject) return;
    navigator.clipboard.writeText(activeProject.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gray-50" style={{ borderRight: "1px solid #e8ecf4" }}>

      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-5 h-16 shrink-0" style={{ borderBottom: "1px solid #e8ecf4" }}>
        <div className="relative">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center animate-neon-pulse"
            style={{ background: "linear-gradient(135deg, #8b5cf6, #06b6d4)" }}>
            <Bug className="h-[18px] w-[18px] text-white" />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />
        </div>
        <div>
          <p className="text-sm font-black tracking-tight text-gradient">BugTracker</p>
          <div className={cn("inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full",
            userRole === "admin"     ? "pill-violet" :
            userRole === "developer" ? "pill-cyan" :
                                       "pill-amber"
          )}>
            <meta.icon className="h-2.5 w-2.5" />
            {meta.label}
          </div>
        </div>
      </div>

      {/* ── Project Selector ── */}
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: "1px solid #e8ecf4" }}>
        {(!Array.isArray(projects) || projects.length === 0) ? (
          permissions.createProject ? (
            <Link href="/dashboard/projects"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all animate-border-glow"
              style={{ background: "rgba(109,40,217,0.12)", border: "1px solid rgba(109,40,217,0.3)" }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
                <Plus className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold text-purple-700">Create a Project</span>
            </Link>
          ) : (
            <Link href="/dashboard/projects"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all"
              style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)" }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)" }}>
                <Plus className="h-3.5 w-3.5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-700">Join a Project</p>
                <p className="text-[10px] text-amber-600/70">Enter your invite code</p>
              </div>
            </Link>
          )
        ) : (
          <>
            <button onClick={() => setProjectMenuOpen(!projectMenuOpen)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left group"
              style={{ background: "#f8f9fc" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(109,40,217,0.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#f8f9fc")}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0"
                style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
                {activeProject?.name.substring(0, 2).toUpperCase() || "??"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{activeProject?.name || "Select Project"}</p>
                <p className="text-[10px]" style={{ color: "#6b7280" }}>{activeProject?.members?.length || 0} members</p>
              </div>
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", projectMenuOpen && "rotate-180")} style={{ color: "rgba(124,58,237,0.6)" }} />
            </button>

            {projectMenuOpen && (
              <div className="mt-1.5 rounded-2xl overflow-hidden animate-scale-in z-50"
                style={{ border: "1px solid rgba(124,58,237,0.25)", background: "#ffffff", boxShadow: "0 16px 48px rgba(0,0,0,0.15)" }}>
                {projects.map((project) => (
                  <button key={project.id}
                    onClick={() => { setActiveProject(project.id); setProjectMenuOpen(false); }}
                    className={cn("w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all",
                      project.id === activeProjectId ? "text-purple-700 font-semibold" : "text-gray-700 hover:text-white"
                    )}
                    style={project.id === activeProjectId ? { background: "rgba(109,40,217,0.15)" } : {}}
                    onMouseEnter={(e) => { if (project.id !== activeProjectId) e.currentTarget.style.background = "rgba(109,40,217,0.04)"; }}
                    onMouseLeave={(e) => { if (project.id !== activeProjectId) e.currentTarget.style.background = ""; }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-black shrink-0"
                      style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
                      {project.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="truncate flex-1 font-medium">{project.name}</span>
                    {project.id === activeProjectId && <Check className="h-3.5 w-3.5 text-purple-600" />}
                  </button>
                ))}
                <div style={{ borderTop: "1px solid rgba(109,40,217,0.15)" }}>
                  {permissions.createProject && (
                    <Link href="/dashboard/projects" onClick={() => setProjectMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 text-sm transition-all"
                      style={{ color: "#6b7280" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(109,40,217,0.04)"; e.currentTarget.style.color = "#e2e8f0"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = ""; e.currentTarget.style.color = "#6b7280"; }}>
                      <Plus className="h-4 w-4" /><span>New Project</span>
                    </Link>
                  )}
                </div>
              </div>
            )}

            {activeProject && permissions.createProject && (
              <button onClick={handleCopyInvite}
                className="mt-1.5 w-full flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all text-xs"
                style={{ color: "#9ca3af" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(109,40,217,0.08)"; e.currentTarget.style.color = "rgba(196,181,253,0.8)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = ""; e.currentTarget.style.color = "#9ca3af"; }}>
                {copied ? <Check className="h-3 w-3 text-emerald-400 shrink-0" /> : <Copy className="h-3 w-3 shrink-0" />}
                <span className="font-mono truncate">{activeProject.inviteCode}</span>
                <span className="ml-auto shrink-0">{copied ? "Copied!" : "Invite"}</span>
              </button>
            )}
          </>
        )}
      </div>

      {/* ── Navigation ── */}
      <ScrollArea className="flex-1 py-4">
        <div className="px-3 space-y-5">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-2 text-[10px] font-black uppercase tracking-widest" style={{ color: "rgba(109,40,217,0.5)" }}>{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = iconMap[item.iconKey];
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-smooth group gpu",
                        isActive
                          ? "text-white font-semibold"
                          : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                      )}
                      style={isActive ? { background: "linear-gradient(135deg, #6d28d9, #2563eb)", boxShadow: "0 4px 12px rgba(109,40,217,0.3)" } : {}}>
                      {Icon && (
                        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all",
                          isActive ? "text-white" : "text-gray-400 group-hover:text-purple-600"
                        )}
                          style={isActive ? { background: "rgba(255,255,255,0.2)" } : { background: "#f1f3f9" }}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                      )}
                      <span className="flex-1">{item.label}</span>
                      {item.label === "Notifications" && unreadCount > 0 && (
                        <span className="flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full text-[10px] text-white font-black animate-bounce-in"
                          style={{ background: "linear-gradient(135deg, #f43f5e, #f97316)" }}>
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ── Team ── */}
        {activeProject?.members && activeProject.members.length > 0 && (
          <div className="px-3 mt-5">
            <p className="px-3 mb-2 text-[10px] font-black uppercase tracking-widest" style={{ color: "rgba(109,40,217,0.5)" }}>Team</p>
            <div className="space-y-0.5">
              {activeProject.members.slice(0, 5).map((member) => {
                const user = getUserById(member.userId);
                if (!user) return null;
                return (
                  <div key={member.userId} className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all"
                    style={{}}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(109,40,217,0.04)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "")}>
                    <div className="relative shrink-0">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-[9px] font-bold"
                          style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)", color: "white" }}>
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white" />
                    </div>
                    <span className="text-xs text-gray-500 truncate flex-1 font-medium">{user.name}</span>
                    <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-semibold capitalize",
                      (member.role as string).toLowerCase() === "admin" ? "pill-violet" :
                      (member.role as string).toLowerCase() === "developer" ? "pill-blue" :
                      "pill-amber"
                    )}>
                      {(member.role as string).toLowerCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </ScrollArea>

      <div className="p-3 shrink-0" style={{ borderTop: "1px solid #e8ecf4" }}>
        <div className="flex items-center gap-3 px-2 py-2 rounded-2xl transition-all cursor-pointer"
          style={{ background: "transparent" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(109,40,217,0.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
          <div className="relative shrink-0">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="text-xs font-black"
                style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)", color: "white" }}>
                {getInitials(currentUser?.name || "U")}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{currentUser?.name || "User"}</p>
            <p className="text-[10px] capitalize" style={{ color: "#9ca3af" }}>{(currentUser?.role || "user").toLowerCase()}</p>
          </div>
          <button onClick={() => { logout(); router.push("/login"); }}
            className="p-1.5 rounded-lg transition-all"
            style={{ color: "#d1d5db" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#fb7185"; e.currentTarget.style.background = "rgba(244,63,94,0.1)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#d1d5db"; e.currentTarget.style.background = ""; }}
            title="Sign out">
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
    <div className="flex min-h-screen bg-gray-50">

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[256px] flex-col fixed inset-y-0 left-0 z-30" style={{ boxShadow: "1px 0 0 rgba(0,0,0,0.04)" }}>
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-[272px] shadow-card-lg transform transition-transform duration-300 ease-spring lg:hidden",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <button className="absolute right-3 top-3 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
          onClick={() => setSidebarOpen(false)}>
          <X className="h-4 w-4" />
        </button>
        <SidebarContent />
      </aside>

      {/* Main */}
      <main className="flex-1 lg:ml-[256px] flex flex-col min-h-screen dashboard-main">

        {/* Top bar */}
        <header className="sticky top-0 z-20 h-16 bg-white flex items-center px-4 lg:px-6 gap-4"
          style={{ borderBottom: "1px solid #e8ecf4", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <button className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
            onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex-1 flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: "rgba(124,58,237,0.6)" }}>Dashboard</span>
              <span style={{ color: "rgba(109,40,217,0.3)" }}>/</span>
              <span className="text-sm font-bold text-gray-800">{currentLabel}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all"
              style={{ background: "rgba(109,40,217,0.04)", border: "1px solid rgba(109,40,217,0.2)", color: "#6b7280" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(109,40,217,0.4)"; e.currentTarget.style.color = "#7c3aed"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(109,40,217,0.2)"; e.currentTarget.style.color = "#6b7280"; }}>
              <Search className="h-3.5 w-3.5" />
              <span className="text-xs">Search...</span>
              <kbd className="ml-1 text-[10px] rounded-md px-1.5 py-0.5 font-mono"
                style={{ background: "rgba(109,40,217,0.1)", border: "1px solid rgba(109,40,217,0.2)", color: "rgba(196,181,253,0.7)" }}>⌘K</kbd>
            </button>

            <Link href="/dashboard/notifications">
              <button className="relative p-2.5 rounded-xl transition-all"
                style={{ color: "#6b7280" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(109,40,217,0.1)"; e.currentTarget.style.color = "#7c3aed"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = ""; e.currentTarget.style.color = "#6b7280"; }}>
                <Bell className="h-[18px] w-[18px]" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full border-2 border-white"
                    style={{ background: "linear-gradient(135deg, #f43f5e, #f97316)" }} />
                )}
              </button>
            </Link>

            <Link href="/dashboard/settings">
              <div className="relative cursor-pointer group">
                <Avatar className="h-9 w-9 ring-2 ring-transparent group-hover:ring-purple-500/40 transition-all">
                  <AvatarFallback className="text-xs font-black"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)", color: "white" }}>
                    {getInitials(currentUser?.name || "U")}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
              </div>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-4 lg:p-6 page-enter">
          {children}
        </div>
      </main>
    </div>

    {/* ── Deadline Alert Toast ── */}
    <DeadlineAlert />

    {/* ── Search Modal ── */}
    {searchOpen && (
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4"
        onClick={() => setSearchOpen(false)}>
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
        <div className="relative w-full max-w-lg animate-scale-in"
          onClick={(e) => e.stopPropagation()}>
          <div className="rounded-2xl overflow-hidden shadow-xl"
            style={{ background: "#ffffff", border: "1px solid #e8ecf4", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: "1px solid rgba(109,40,217,0.15)" }}>
              <Search className="h-[18px] w-[18px] text-purple-600 shrink-0" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search tasks, bugs, projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 text-sm text-gray-800 placeholder:text-gray-400 outline-none bg-transparent"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-700">
                  <X className="h-4 w-4" />
                </button>
              )}
              <kbd className="text-[10px] rounded px-1.5 py-0.5 font-mono shrink-0"
                style={{ background: "rgba(109,40,217,0.1)", border: "1px solid rgba(109,40,217,0.2)", color: "rgba(196,181,253,0.7)" }}>ESC</kbd>
            </div>

            {/* Results */}
            {searchQuery.trim().length >= 2 && (
              <div className="py-2 max-h-80 overflow-y-auto">
                {searchResults.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm text-gray-400">No results for "<span className="font-medium text-gray-700">{searchQuery}</span>"</p>
                  </div>
                ) : (
                  <>
                    {searchResults.map((r, i) => (
                      <Link key={i} href={r.href}
                        onClick={() => setSearchOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 transition-colors group"
                        style={{}}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(109,40,217,0.1)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "")}>
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                          r.type === "Task" ? "icon-violet" : r.type === "Bug" ? "icon-rose" : "icon-blue"
                        )}>
                          <r.icon className={cn("h-4 w-4", r.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{r.label}</p>
                          <p className="text-xs text-gray-400 capitalize">{r.type} · {r.sub}</p>
                        </div>
                        <span className="text-[10px] text-slate-600 group-hover:text-purple-600 transition-colors">↵ Open</span>
                      </Link>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* Hints */}
            {searchQuery.trim().length < 2 && (
              <div className="px-4 py-4">
                <p className="text-xs text-gray-400 mb-3 font-medium">Quick navigation</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: "Overview",    href: "/dashboard",              icon: LayoutDashboard, color: "icon-violet" },
                    { label: "Kanban",      href: "/dashboard/kanban",       icon: Kanban,          color: "icon-blue" },
                    { label: "Bug Reports", href: "/dashboard/bugs",         icon: Bug,             color: "icon-rose" },
                    { label: "Activity",    href: "/dashboard/activity",     icon: Activity,        color: "icon-emerald" },
                    { label: "Notifications", href: "/dashboard/notifications", icon: Bell,         color: "icon-amber" },
                    { label: "Settings",    href: "/dashboard/settings",     icon: Settings,        color: "icon-indigo" },
                  ].map((item) => (
                    <Link key={item.href} href={item.href}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all"
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(109,40,217,0.04)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "")}>
                      <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center shrink-0", item.color)}>
                        <item.icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs font-medium text-gray-500">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
}


