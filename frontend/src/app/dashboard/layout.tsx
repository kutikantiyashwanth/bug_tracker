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
  admin:     { label: "Project Lead", icon: Shield,    gradient: "from-indigo-500 to-indigo-600", text: "text-indigo-600" },
  developer: { label: "Team Member",  icon: Code2,     gradient: "from-emerald-500 to-teal-600",   text: "text-emerald-600" },
  tester:    { label: "QA Analyst",   icon: TestTube2, gradient: "from-amber-500 to-orange-600",  text: "text-amber-600" },
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

  const SidebarContent = () =>       {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-6 h-20 shrink-0">
        <div className="relative group cursor-pointer">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
            <Bug className="h-5 w-5 text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-900 animate-pulse" />
        </div>
        <div>
          <p className="text-lg font-black tracking-tighter text-white">Bug<span className="text-purple-400">Tracker</span></p>
          <div className={cn("inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest bg-white/5 text-white/50",
            userRole === "admin"     ? "text-violet-400" :
            userRole === "developer" ? "text-cyan-400" :
                                       "text-amber-400"
          )}>
            <meta.icon className="h-2 w-2" />
            {meta.label}
          </div>
        </div>
      </div>

      {/* ── Project Selector ── */}
      <div className="px-4 py-4 shrink-0">
        {(!Array.isArray(projects) || projects.length === 0) ? (
          <Link href="/dashboard/projects"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all glass hover:bg-white/10 group">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/5 group-hover:bg-white/20 transition-colors">
              <Plus className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-white/80">Setup Workspace</span>
          </Link>
        ) : (
          <div className="relative">
            <button onClick={() => setProjectMenuOpen(!projectMenuOpen)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all glass-dark hover:bg-white/5 text-left group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-black shrink-0 bg-gradient-to-tr from-purple-600 to-blue-600 shadow-inner">
                {activeProject?.name.substring(0, 2).toUpperCase() || "??"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{activeProject?.name || "Select Project"}</p>
                <p className="text-[10px] text-white/40 font-medium tracking-tight">{activeProject?.members?.length || 0} collaborators</p>
              </div>
              <ChevronDown className={cn("h-4 w-4 transition-transform duration-300 text-white/30", projectMenuOpen && "rotate-180")} />
            </button>

            {projectMenuOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 p-2 rounded-2xl glass-dark border-white/10 shadow-2xl z-50 animate-slide-up">
                <div className="max-h-60 overflow-y-auto no-scrollbar space-y-1">
                  {projects.map((project) => (
                    <button key={project.id}
                      onClick={() => { setActiveProject(project.id); setProjectMenuOpen(false); }}
                      className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                        project.id === activeProjectId ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                      )}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-black shrink-0 bg-white/10">
                        {project.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="truncate flex-1 font-semibold">{project.name}</span>
                      {project.id === activeProjectId && <Check className="h-4 w-4 text-purple-400" />}
                    </button>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t border-white/5">
                  <Link href="/dashboard/projects" onClick={() => setProjectMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/5 transition-all">
                    <Plus className="h-4 w-4" />
                    <span className="font-semibold">New Project</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-8 py-4">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              <p className="px-4 mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">{group.label}</p>
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = iconMap[item.iconKey];
                return (
                  <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "nav-link group relative",
                      isActive ? "active" : "hover:bg-white/5 hover:text-white"
                    )}>
                    <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
                      isActive ? "bg-white/20 text-white" : "bg-white/5 text-white/30 group-hover:bg-white/10 group-hover:text-white"
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="font-semibold flex-1 tracking-tight">{item.label}</span>
                    {item.label === "Notifications" && unreadCount > 0 && (
                      <span className="flex items-center justify-center h-5 min-w-5 px-1.5 rounded-lg text-[10px] text-white font-black bg-rose-500 shadow-lg shadow-rose-500/20">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}

          {/* ── Team Section ── */}
          {activeProject?.members && activeProject.members.length > 0 && (
            <div className="space-y-1 pt-4">
              <p className="px-4 mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Collaborators</p>
              <div className="space-y-1 px-2">
                {activeProject.members.slice(0, 5).map((member) => {
                  const user = getUserById(member.userId);
                  if (!user) return null;
                  return (
                    <div key={member.userId} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-all group cursor-pointer">
                      <div className="relative shrink-0">
                        <Avatar className="h-8 w-8 border border-white/10 group-hover:border-white/30 transition-colors">
                          <AvatarFallback className="text-[10px] font-black bg-gradient-to-br from-slate-700 to-slate-900 text-white/80">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white/70 group-hover:text-white truncate">{user.name}</p>
                        <p className="text-[9px] font-medium text-white/30 uppercase tracking-tighter">{(member.role as string).toLowerCase()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* ── User Profile ── */}
      <div className="p-4 shrink-0">
        <div className="p-3 rounded-2xl glass-dark border-white/5 flex items-center gap-3 group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <Avatar className="h-10 w-10 border border-white/10">
            <AvatarFallback className="text-xs font-black bg-gradient-to-tr from-indigo-500 to-purple-600 text-white">
              {getInitials(currentUser?.name || "U")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 z-10">
            <p className="text-sm font-bold text-white truncate">{currentUser?.name || "Anonymous"}</p>
            <p className="text-[10px] font-medium text-white/40 uppercase tracking-widest">{(currentUser?.role || "USER").toLowerCase()}</p>
          </div>
          <button onClick={() => { logout(); router.push("/login"); }}
            className="p-2 rounded-xl text-white/20 hover:text-rose-400 hover:bg-rose-500/10 transition-all z-10"
            title="Sign out">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
    <div className="flex min-h-screen bg-[#f8fafc]">

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[280px] flex-col fixed inset-y-0 left-0 z-30 bg-[#0f172a] shadow-2xl">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-md lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-[280px] bg-[#0f172a] transform transition-transform duration-500 ease-[cubic-bezier(0.32,0,0.67,0)] lg:hidden",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <button className="absolute right-4 top-4 p-2 rounded-xl text-white/20 hover:text-white hover:bg-white/5 transition-all"
          onClick={() => setSidebarOpen(false)}>
          <X className="h-5 w-5" />
        </button>
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-[280px] flex flex-col min-h-screen">

        {/* Top bar / Header */}
        <header className="sticky top-0 z-20 h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex items-center px-6 lg:px-8 gap-6">
          <button className="lg:hidden p-2.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
            onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex-1 flex items-center">
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
                <span>Workspace</span>
                <ChevronDown className="h-3 w-3 -rotate-90 opacity-50" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{currentLabel}</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="hidden md:block relative">
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-100 border border-transparent hover:border-slate-200 hover:bg-white hover:shadow-sm transition-all text-slate-500 w-64 group">
                <Search className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                <span className="text-sm font-medium">Search anything...</span>
                <kbd className="ml-auto text-[10px] font-bold text-slate-300">⌘K</kbd>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/dashboard/notifications">
                <button className="relative p-3 rounded-2xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full border-2 border-white bg-rose-500" />
                  )}
                </button>
              </Link>

              <div className="h-8 w-[1px] bg-slate-200 mx-1" />

              <Link href="/dashboard/settings" className="flex items-center gap-3 group">
                <div className="text-right hidden xl:block">
                  <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-none">{currentUser?.name?.split(" ")[0]}</p>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1">Profile</p>
                </div>
                <Avatar className="h-10 w-10 ring-2 ring-transparent group-hover:ring-indigo-500/20 transition-all border border-slate-200">
                  <AvatarFallback className="text-xs font-black bg-slate-100 text-slate-600">
                    {getInitials(currentUser?.name || "U")}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 p-6 lg:p-10 max-w-[1600px] w-full mx-auto animate-slide-up">
          {children}
        </div>
      </main>
    </div>
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


