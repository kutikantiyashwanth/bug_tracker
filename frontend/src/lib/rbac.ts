// ─── Role-Based Access Control ───
// Defines what each role can see and do

export type UserRole = "admin" | "developer" | "tester" | "ADMIN" | "DEVELOPER" | "TESTER";

export const normalizeRole = (role: string): "admin" | "developer" | "tester" =>
  role.toLowerCase() as "admin" | "developer" | "tester";

// ── What pages each role can access ──
export const rolePages: Record<string, string[]> = {
  admin: [
    "/dashboard",
    "/dashboard/kanban",
    "/dashboard/bugs",
    "/dashboard/projects",
    "/dashboard/activity",
    "/dashboard/time-tracking",
    "/dashboard/notifications",
    "/dashboard/settings",
  ],
  developer: [
    "/dashboard",
    "/dashboard/kanban",
    "/dashboard/bugs",
    "/dashboard/activity",
    "/dashboard/time-tracking",
    "/dashboard/notifications",
    "/dashboard/settings",
    // NO /dashboard/projects (can't create, only joined via invite)
  ],
  tester: [
    "/dashboard",
    "/dashboard/bugs",
    "/dashboard/activity",
    "/dashboard/notifications",
    "/dashboard/settings",
    // NO kanban (can view but not create tasks)
    // NO projects management
  ],
};

// ── Nav items per role ──
export const roleNavGroups = (role: string) => {
  const r = normalizeRole(role);

  const main = [
    { href: "/dashboard", label: "Overview", icon: "LayoutDashboard", roles: ["admin", "developer", "tester"] },
    { href: "/dashboard/kanban", label: "Kanban Board", icon: "Kanban", roles: ["admin", "developer"] },
    { href: "/dashboard/bugs", label: "Bug Reports", icon: "AlertTriangle", roles: ["admin", "developer", "tester"] },
    { href: "/dashboard/projects", label: "Projects", icon: "FolderOpen", roles: ["admin"] },
  ].filter((item) => item.roles.includes(r));

  const insights = [
    { href: "/dashboard/activity", label: "Activity Log", icon: "Activity", roles: ["admin", "developer", "tester"] },
    { href: "/dashboard/time-tracking", label: "Time Tracking", icon: "Clock", roles: ["admin", "developer"] },
    { href: "/dashboard/notifications", label: "Notifications", icon: "Bell", roles: ["admin", "developer", "tester"] },
  ].filter((item) => item.roles.includes(r));

  const account = [
    { href: "/dashboard/settings", label: "Settings", icon: "Settings", roles: ["admin", "developer", "tester"] },
  ];

  return [
    { label: "Main", items: main },
    { label: "Insights", items: insights },
    { label: "Account", items: account },
  ].filter((g) => g.items.length > 0);
};

// ── Permissions ──
export const can = (role: string) => {
  const r = normalizeRole(role);
  return {
    // Project management
    createProject:    r === "admin",
    deleteProject:    r === "admin",
    manageMembers:    r === "admin",
    viewProjects:     r === "admin",

    // Task management
    createTask:       r === "admin" || r === "developer",
    editTask:         r === "admin" || r === "developer",
    deleteTask:       r === "admin",
    moveTask:         r === "admin" || r === "developer",
    viewKanban:       r === "admin" || r === "developer",

    // Bug management
    reportBug:        true, // all roles
    editOwnBug:       true, // all roles
    deleteBug:        r === "admin",
    assignBug:        r === "admin",
    changeBugStatus:  r === "admin" || r === "developer",

    // Team
    inviteMembers:    r === "admin",
    viewTeam:         true,

    // Analytics
    viewAnalytics:    r === "admin" || r === "developer",
    viewActivity:     true,
  };
};
