// @ts-nocheck
/* eslint-disable */
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "./lib/prisma";
import {
  sendBugAssignedEmail, sendBugResolvedEmail,
  sendTaskAssignedEmail, sendCommentEmail,
  sendDeadlineReminderEmail, isEmailConfigured,
} from "./lib/email";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});

// ─── Middleware ───
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    // Allow localhost and any onrender.com domain
    if (
      origin.includes('localhost') ||
      origin.includes('onrender.com') ||
      origin === process.env.FRONTEND_URL
    ) {
      return callback(null, true);
    }
    return callback(null, true); // Allow all for now
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(helmet());
app.use(compression());
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Cache-Control headers for GET requests ───
// Tells the browser/axios to treat responses as fresh for 30s,
// then revalidate — keeps page loads fast without stale data.
app.use((req, res, next) => {
  if (req.method === "GET") {
    res.setHeader("Cache-Control", "private, max-age=30, stale-while-revalidate=60");
  } else {
    res.setHeader("Cache-Control", "no-store");
  }
  next();
});

// ─── Auth Middleware ───
const authMiddleware = async (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// ─── Health Check ───
app.get("/api/v1/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: "connected",
  });
});

// ─── Auth Routes ───
app.post("/api/v1/auth/register", async (req, res) => {
  try {
    const { email, name, password, role, skills } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({ error: "Email, name, and password are required" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role?.toUpperCase() || "DEVELOPER",
        skills: Array.isArray(skills) ? skills : [],
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        skills: true,
        createdAt: true,
      },
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { user, token },
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

app.post("/api/v1/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          skills: user.skills,
        },
        token,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

app.get("/api/v1/auth/me", authMiddleware, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true, email: true, name: true,
        role: true, skills: true, avatar: true, createdAt: true,
      },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Update profile ───
app.patch("/api/v1/auth/profile", authMiddleware, async (req: any, res) => {
  try {
    const { name, skills } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        ...(name && { name }),
        ...(Array.isArray(skills) && { skills }),
      },
      select: { id: true, email: true, name: true, role: true, skills: true, createdAt: true },
    });
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Change password ───
app.patch("/api/v1/auth/password", authMiddleware, async (req: any, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Both current and new password are required" });
    }
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(401).json({ error: "Current password is incorrect" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: req.user.userId }, data: { password: hashed } });
    res.json({ success: true, message: "Password updated successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Project Routes ───
app.get("/api/v1/projects", authMiddleware, async (req: any, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: req.user.userId },
          { members: { some: { userId: req.user.userId } } },
        ],
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true } },
          },
        },
        _count: {
          select: { tasks: true, bugs: true },
        },
      },
    });

    res.json({ success: true, data: projects });
  } catch (error: any) {
    console.error("Get projects error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

app.post("/api/v1/projects", authMiddleware, async (req: any, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Project name is required" });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        ownerId: req.user.userId,
        members: {
          create: {
            userId: req.user.userId,
            role: "ADMIN",
          },
        },
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true } },
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (error: any) {
    console.error("Create project error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

app.post("/api/v1/projects/join", authMiddleware, async (req: any, res) => {
  try {
    const { inviteCode } = req.body;

    if (!inviteCode) {
      return res.status(400).json({ error: "Invite code is required" });
    }

    const project = await prisma.project.findUnique({
      where: { inviteCode },
      include: { members: true },
    });

    if (!project) {
      return res.status(404).json({ error: "Invalid invite code" });
    }

    const isMember = project.members.some((m) => m.userId === req.user.userId);
    if (isMember) {
      return res.status(400).json({ error: "Already a member of this project" });
    }

    await prisma.projectMember.create({
      data: {
        projectId: project.id,
        userId: req.user.userId,
        role: "DEVELOPER",
      },
    });

    const fullProject = await prisma.project.findUnique({
      where: { id: project.id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true } },
          },
        },
        _count: { select: { tasks: true, bugs: true } },
      },
    });

    res.json({
      success: true,
      message: "Joined project successfully",
      data: fullProject,
    });
  } catch (error: any) {
    console.error("Join project error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// ─── Task Routes ───
app.get("/api/v1/projects/:projectId/tasks", authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;

    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: tasks });
  } catch (error: any) {
    console.error("Get tasks error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

app.post("/api/v1/projects/:projectId/tasks", authMiddleware, async (req: any, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, status, priority, assigneeId, dueDate, tags } = req.body;

    if (!title) return res.status(400).json({ error: "Task title is required" });

    // Convert frontend lowercase enums → DB uppercase
    const dbStatus   = (status   || "backlog").toUpperCase().replace("-", "_");
    const dbPriority = (priority || "medium").toUpperCase();

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status:   dbStatus,
        priority: dbPriority,
        projectId,
        createdById: req.user.userId,
        assigneeId: assigneeId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        tags: tags || [],
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        projectId,
        userId: req.user.userId,
        action: "created",
        entityType: "TASK",
        entityId: task.id,
        details: `Created task '${task.title}'`,
      },
    });

    // Notify assignee if different from creator
    if (assigneeId && assigneeId !== req.user.userId) {
      await prisma.notification.create({
        data: {
          userId: assigneeId,
          type: "TASK_ASSIGNED",
          title: "New Task Assigned",
          message: `You have been assigned to "${task.title}"`,
          link: `/dashboard/kanban`,
        },
      });
      io.to(`user:${assigneeId}`).emit("notification", { type: "TASK_ASSIGNED", title: "New Task Assigned" });

      // Send email
      const assignee = await prisma.user.findUnique({ where: { id: assigneeId } });
      const project  = await prisma.project.findUnique({ where: { id: projectId } });
      if (assignee?.email) {
        sendTaskAssignedEmail(assignee.email, {
          assigneeName: assignee.name,
          taskTitle: task.title,
          priority: dbPriority.toLowerCase(),
          projectName: project?.name || "Your Project",
          description: description,
        });
      }
    }

    res.status(201).json({ success: true, message: "Task created successfully", data: task });
  } catch (error: any) {
    console.error("Create task error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

app.patch("/api/v1/tasks/:taskId", authMiddleware, async (req: any, res) => {
  try {
    const { taskId } = req.params;
    const updates = req.body;

    // Convert any lowercase enums to uppercase for Prisma
    if (updates.status)   updates.status   = updates.status.toUpperCase().replace("-", "_");
    if (updates.priority) updates.priority = updates.priority.toUpperCase();

    const task = await prisma.task.update({
      where: { id: taskId },
      data: updates,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    res.json({ success: true, message: "Task updated successfully", data: task });
  } catch (error: any) {
    console.error("Update task error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

app.delete("/api/v1/tasks/:taskId", authMiddleware, async (req, res) => {
  try {
    const { taskId } = req.params;

    await prisma.task.delete({ where: { id: taskId } });

    res.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete task error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// ─── Bug Routes ───
app.get("/api/v1/projects/:projectId/bugs", authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;

    const bugs = await prisma.bug.findMany({
      where: { projectId },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        reporter: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: bugs });
  } catch (error: any) {
    console.error("Get bugs error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

app.post("/api/v1/projects/:projectId/bugs", authMiddleware, async (req: any, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, stepsToReproduce, severity, assigneeId, screenshotUrl } = req.body;

    if (!title) return res.status(400).json({ error: "Bug title is required" });

    // Convert frontend lowercase → DB uppercase
    const dbSeverity = (severity || "major").toUpperCase();

    const bug = await prisma.bug.create({
      data: {
        title,
        description,
        stepsToReproduce,
        severity: dbSeverity,
        status: "OPEN",
        screenshotUrl: screenshotUrl || null,
        projectId,
        reporterId: req.user.userId,
        assigneeId: assigneeId || null,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        reporter: { select: { id: true, name: true, email: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        projectId,
        userId: req.user.userId,
        action: "reported",
        entityType: "BUG",
        entityId: bug.id,
        details: `Reported bug '${bug.title}'`,
      },
    });

    // Notify assignee if different from reporter
    if (assigneeId && assigneeId !== req.user.userId) {
      await prisma.notification.create({
        data: {
          userId: assigneeId,
          type: "BUG_ASSIGNED",
          title: "Bug Assigned to You",
          message: `You have been assigned to fix "${bug.title}" (${dbSeverity.toLowerCase()} severity)`,
          link: `/dashboard/bugs`,
        },
      });
      io.to(`user:${assigneeId}`).emit("notification", { type: "BUG_ASSIGNED", title: "Bug Assigned to You" });

      // Send email
      const assignee = await prisma.user.findUnique({ where: { id: assigneeId } });
      const reporter = await prisma.user.findUnique({ where: { id: req.user.userId } });
      const project  = await prisma.project.findUnique({ where: { id: projectId } });
      if (assignee?.email) {
        sendBugAssignedEmail(assignee.email, {
          assigneeName: assignee.name,
          bugTitle: bug.title,
          severity: dbSeverity.toLowerCase(),
          reporterName: reporter?.name || "Someone",
          projectName: project?.name || "Your Project",
          description: description,
        });
      }
    }

    res.status(201).json({ success: true, message: "Bug reported successfully", data: bug });
  } catch (error: any) {
    console.error("Create bug error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

app.patch("/api/v1/bugs/:bugId", authMiddleware, async (req: any, res) => {
  try {
    const { bugId } = req.params;
    const updates = req.body;

    // Convert lowercase enums → uppercase for Prisma
    if (updates.status)   updates.status   = updates.status.toUpperCase().replace("-", "_");
    if (updates.severity) updates.severity = updates.severity.toUpperCase();

    const bug = await prisma.bug.update({
      where: { id: bugId },
      data: updates,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        reporter: { select: { id: true, name: true, email: true } },
      },
    });

    // If marked resolved → notify reporter AND project owner
    if (updates.status === "RESOLVED" && bug.reporterId !== req.user.userId) {
      const resolver = await prisma.user.findUnique({ where: { id: req.user.userId } });
      const project = await prisma.project.findUnique({ where: { id: bug.projectId } });
      const notifyIds = new Set<string>();
      notifyIds.add(bug.reporterId);
      if (project?.ownerId) notifyIds.add(project.ownerId);
      notifyIds.delete(req.user.userId);

      for (const uid of notifyIds) {
        await prisma.notification.create({
          data: {
            userId: uid,
            type: "BUG_RESOLVED",
            title: `✅ Bug Resolved: "${bug.title}"`,
            message: `${resolver?.name || "Developer"} marked this bug as resolved. Please review and close.`,
            link: `/dashboard/bugs`,
          },
        });
        io.to(`user:${uid}`).emit("notification", { type: "BUG_RESOLVED", title: "Bug Resolved" });

        // Send email
        const recipient = await prisma.user.findUnique({ where: { id: uid } });
        if (recipient?.email) {
          sendBugResolvedEmail(recipient.email, {
            recipientName: recipient.name,
            bugTitle: bug.title,
            resolverName: resolver?.name || "Developer",
            projectName: project?.name || "Your Project",
          });
        }
      }

      // Log activity
      await prisma.activityLog.create({
        data: {
          projectId: bug.projectId,
          userId: req.user.userId,
          action: "resolved",
          entityType: "BUG",
          entityId: bug.id,
          details: `Resolved bug '${bug.title}'`,
        },
      });
    }

    res.json({ success: true, message: "Bug updated successfully", data: bug });
  } catch (error: any) {
    console.error("Update bug error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// ─── GitHub Link Routes ───
// GET all links for a project
app.get("/api/v1/projects/:projectId/github-links", authMiddleware, async (req, res) => {
  try {
    const links = await prisma.gitHubLink.findMany({
      where: { projectId: req.params.projectId },
    });
    res.json({ success: true, data: links });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// UPSERT a link for an item (task or bug)
app.put("/api/v1/projects/:projectId/github-links/:itemId", authMiddleware, async (req, res) => {
  try {
    const { projectId, itemId } = req.params;
    const { itemType, linkType, number, url } = req.body;
    if (!itemType || !linkType || !number) {
      return res.status(400).json({ error: "itemType, linkType, and number are required" });
    }
    const link = await prisma.gitHubLink.upsert({
      where: { projectId_itemId: { projectId, itemId } },
      create: { projectId, itemId, itemType, linkType, number, url: url || "" },
      update: { itemType, linkType, number, url: url || "" },
    });
    res.json({ success: true, data: link });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE a link
app.delete("/api/v1/projects/:projectId/github-links/:itemId", authMiddleware, async (req, res) => {
  try {
    const { projectId, itemId } = req.params;
    await prisma.gitHubLink.deleteMany({ where: { projectId, itemId } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET / SET repo URL (stored as a special link with itemId = "__repo__")
app.get("/api/v1/projects/:projectId/github-repo", authMiddleware, async (req, res) => {
  try {
    const link = await prisma.gitHubLink.findUnique({
      where: { projectId_itemId: { projectId: req.params.projectId, itemId: "__repo__" } },
    });
    res.json({ success: true, data: { repoUrl: link?.url || "" } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/v1/projects/:projectId/github-repo", authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { repoUrl } = req.body;
    await prisma.gitHubLink.upsert({
      where: { projectId_itemId: { projectId, itemId: "__repo__" } },
      create: { projectId, itemId: "__repo__", itemType: "repo", linkType: "repo", number: "0", url: repoUrl || "" },
      update: { url: repoUrl || "" },
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Sprint Routes ───
// GET all sprints for a project
app.get("/api/v1/projects/:projectId/sprints", authMiddleware, async (req, res) => {
  try {
    const sprints = await prisma.sprint.findMany({
      where: { projectId: req.params.projectId },
      orderBy: { createdAt: "asc" },
    });
    res.json({ success: true, data: sprints });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE sprint
app.post("/api/v1/projects/:projectId/sprints", authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, goal, startDate, endDate } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: "Sprint name is required" });
    const sprint = await prisma.sprint.create({
      data: {
        projectId,
        name: name.trim(),
        goal: goal?.trim() || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status: "PLANNED",
        taskIds: [],
      },
    });
    res.status(201).json({ success: true, data: sprint });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE sprint (status, taskIds, etc.)
app.patch("/api/v1/sprints/:sprintId", authMiddleware, async (req, res) => {
  try {
    const { sprintId } = req.params;
    const { name, goal, startDate, endDate, status, taskIds } = req.body;
    const sprint = await prisma.sprint.update({
      where: { id: sprintId },
      data: {
        ...(name      !== undefined && { name }),
        ...(goal      !== undefined && { goal }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate   !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(status    !== undefined && { status: status.toUpperCase() as any }),
        ...(taskIds   !== undefined && { taskIds }),
      },
    });
    res.json({ success: true, data: sprint });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE sprint
app.delete("/api/v1/sprints/:sprintId", authMiddleware, async (req, res) => {
  try {
    await prisma.sprint.delete({ where: { id: req.params.sprintId } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── AI Bug Analysis ───
app.post("/api/v1/ai/analyze-bug", authMiddleware, async (req: any, res) => {
  try {
    const { title = "", description = "", stepsToReproduce = "" } = req.body;
    const text = `${title} ${description} ${stepsToReproduce}`.toLowerCase();

    let severity = "minor";
    let reason = "Appears to be a low-impact cosmetic issue";
    let priority = "low";
    let estimatedTime = "30 min – 1 hour";
    const tags: string[] = [];

    // ── Critical patterns ──
    if (text.match(/crash|system down|not working|cannot login|unable to login|blocked|data loss|data breach|security|payment fail|production down|urgent|critical|500 error|database error|server error|infinite loop|memory leak|null pointer|unhandled exception/)) {
      severity = "critical";
      reason = "Keywords indicate a critical blocking issue — system crash, security risk, or data loss";
      priority = "critical";
      estimatedTime = "2–4 hours";
      tags.push("critical", "urgent", "blocking");
    }
    // ── Major patterns ──
    else if (text.match(/error|fail|wrong|incorrect|missing|broken|bug|issue|problem|not load|doesn't work|404|null|undefined|exception|invalid|unexpected|cannot|unable|won't|doesn't|not showing|not saving|not updating/)) {
      severity = "major";
      reason = "Keywords indicate a significant functional issue affecting core features";
      priority = "high";
      estimatedTime = "3–6 hours";
      tags.push("bug", "functional");
    }
    // ── Minor patterns ──
    else {
      severity = "minor";
      reason = "Appears to be a minor UI, cosmetic, or low-impact issue";
      priority = "low";
      estimatedTime = "30 min – 1 hour";
      tags.push("ui", "minor");
    }

    // ── Category detection ──
    if (text.match(/login|logout|auth|password|token|session|jwt|oauth|signup|register/)) tags.push("authentication");
    if (text.match(/ui|button|style|color|layout|display|visual|css|design|icon|font|spacing|alignment/)) tags.push("ui");
    if (text.match(/api|request|response|endpoint|fetch|axios|http|rest|graphql|websocket/)) tags.push("api");
    if (text.match(/mobile|phone|tablet|responsive|ios|android|touch|swipe/)) tags.push("mobile");
    if (text.match(/performance|slow|timeout|loading|lag|freeze|memory|cpu|speed/)) tags.push("performance");
    if (text.match(/database|db|sql|query|migration|schema|prisma|mongo/)) tags.push("database");
    if (text.match(/file|upload|download|image|video|attachment|storage/)) tags.push("file-handling");
    if (text.match(/email|notification|alert|sms|push/)) tags.push("notifications");
    if (text.match(/payment|billing|invoice|subscription|stripe|paypal/)) tags.push("payments");
    if (text.match(/search|filter|sort|pagination|query/)) tags.push("search");

    // ── Suggested assignee role ──
    const suggestedRole = severity === "critical" ? "Senior Developer" :
                          severity === "major"    ? "Developer" : "Junior Developer / Tester";

    res.json({
      success: true,
      data: {
        severity,
        priority,
        reason,
        estimatedTime,
        suggestedTags: [...new Set(tags)],
        suggestedRole,
        confidence: severity === "critical" ? "High" : severity === "major" ? "Medium" : "Low",
        summary: `This appears to be a ${severity} severity bug. ${reason}. Estimated fix time: ${estimatedTime}.`,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Comment Routes ───
app.get("/api/v1/bugs/:bugId/comments", authMiddleware, async (req: any, res) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { bugId: req.params.bugId },
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
      orderBy: { createdAt: "asc" },
    });
    res.json({ success: true, data: comments });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/v1/bugs/:bugId/comments", authMiddleware, async (req: any, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: "Comment content required" });

    const bug = await prisma.bug.findUnique({
      where: { id: req.params.bugId },
      include: { reporter: true, assignee: true },
    });
    if (!bug) return res.status(404).json({ error: "Bug not found" });

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId: req.user.userId,
        bugId: req.params.bugId,
      },
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
    });

    // Notify the other party:
    // If developer comments → notify reporter AND project owner (admin)
    // If admin/reporter comments → notify assignee (developer)
    const commenter = await prisma.user.findUnique({ where: { id: req.user.userId } });

    // Get project owner
    const project = await prisma.project.findUnique({ where: { id: bug.projectId } });
    const notifyUserIds = new Set<string>();

    if (req.user.userId === bug.assigneeId) {
      // Developer commenting → notify reporter
      if (bug.reporterId) notifyUserIds.add(bug.reporterId);
      // Also notify project owner (admin) if different
      if (project?.ownerId) notifyUserIds.add(project.ownerId);
    } else {
      // Reporter/admin commenting → notify assignee (developer)
      if (bug.assigneeId) notifyUserIds.add(bug.assigneeId);
    }

    // Remove self from notifications
    notifyUserIds.delete(req.user.userId);

    for (const userId of notifyUserIds) {
      await prisma.notification.create({
        data: {
          userId,
          type: "BUG_RESOLVED",
          title: `💬 Comment on "${bug.title}"`,
          message: `${commenter?.name || "Someone"}: ${content.trim().substring(0, 80)}`,
          link: `/dashboard/bugs`,
        },
      });
      io.to(`user:${userId}`).emit("notification", {
        type: "comment",
        title: `New comment on "${bug.title}"`,
      });

      // Send email
      const recipient = await prisma.user.findUnique({ where: { id: userId } });
      if (recipient?.email) {
        sendCommentEmail(recipient.email, {
          recipientName: recipient.name,
          commenterName: commenter?.name || "Someone",
          bugTitle: bug.title,
          comment: content.trim().substring(0, 200),
          projectName: project?.name || "Your Project",
        });
      }
    }

    res.status(201).json({ success: true, data: comment });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Notification Routes ───
app.get("/api/v1/notifications", authMiddleware, async (req: any, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json({ success: true, data: notifications });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// IMPORTANT: read-all must come BEFORE /:id route
app.patch("/api/v1/notifications/read-all", authMiddleware, async (req: any, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.userId, read: false },
      data: { read: true },
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.patch("/api/v1/notifications/:id/read", authMiddleware, async (req: any, res) => {
  try {
    await prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true },
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/v1/projects/:projectId/activities", authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;

    const activities = await prisma.activityLog.findMany({
      where: { projectId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    res.json({ success: true, data: activities });
  } catch (error: any) {
    console.error("Get activities error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// ─── Socket.io ───
io.on("connection", (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  // Join personal room for notifications
  socket.on("join-user", (userId: string) => {
    socket.join(`user:${userId}`);
  });

  socket.on("join-project", (projectId: string) => {
    socket.join(`project:${projectId}`);
  });

  socket.on("leave-project", (projectId: string) => {
    socket.leave(`project:${projectId}`);
  });

  socket.on("task-moved", (data: { projectId: string; taskId: string; status: string }) => {
    socket.to(`project:${data.projectId}`).emit("task-updated", data);
  });

  socket.on("bug-reported", (data: { projectId: string; bug: any }) => {
    socket.to(`project:${data.projectId}`).emit("new-bug", data);
  });

  socket.on("disconnect", () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
  });
});

// ─── Deadline Reminder Job (runs every hour) ───
const checkDeadlines = async () => {
  try {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    // Find tasks due in next 24-48 hours that haven't been notified recently
    const upcomingTasks = await prisma.task.findMany({
      where: {
        dueDate: { gte: now, lte: in48h },
        status: { notIn: ["DONE"] },
        assigneeId: { not: null },
      },
      include: {
        assignee: true,
        project: true,
      },
    });

    for (const task of upcomingTasks) {
      if (!task.assigneeId || !task.assignee) continue;
      const daysLeft = Math.ceil((new Date(task.dueDate!).getTime() - now.getTime()) / 86400000);

      // Check if we already sent a reminder today
      const existingNotif = await prisma.notification.findFirst({
        where: {
          userId: task.assigneeId,
          type: "DEADLINE_REMINDER",
          link: `/dashboard/kanban`,
          createdAt: { gte: new Date(now.getTime() - 20 * 60 * 60 * 1000) }, // within last 20h
          message: { contains: task.title },
        },
      });
      if (existingNotif) continue;

      // Create in-app notification
      await prisma.notification.create({
        data: {
          userId: task.assigneeId,
          type: "DEADLINE_REMINDER",
          title: `⏰ Deadline ${daysLeft <= 1 ? "Tomorrow!" : `in ${daysLeft} days`}`,
          message: `Task "${task.title}" is due ${daysLeft <= 1 ? "tomorrow" : `in ${daysLeft} days`}`,
          link: `/dashboard/kanban`,
        },
      });

      // Push real-time
      io.to(`user:${task.assigneeId}`).emit("notification", { type: "DEADLINE_REMINDER", title: "Deadline Reminder" });

      // Send email
      if (task.assignee.email) {
        const { sendDeadlineReminderEmail } = await import("./lib/email");
        sendDeadlineReminderEmail(task.assignee.email, {
          recipientName: task.assignee.name,
          taskTitle: task.title,
          dueDate: new Date(task.dueDate!).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
          daysLeft,
          projectName: task.project?.name || "Your Project",
        });
      }
    }
    if (upcomingTasks.length > 0) {
      console.log(`[Deadline Reminders] Processed ${upcomingTasks.length} upcoming tasks`);
    }
  } catch (err) {
    console.error("[Deadline Reminders] Error:", err);
  }
};

// Run deadline check every hour
setInterval(checkDeadlines, 60 * 60 * 1000);
// Also run once on startup after 30 seconds
setTimeout(checkDeadlines, 30 * 1000);

// ─── Analytics Endpoint ───
app.get("/api/v1/projects/:projectId/analytics", authMiddleware, async (req: any, res) => {
  try {
    const { projectId } = req.params;

    // Get all tasks and bugs
    const [tasks, bugs, activities] = await Promise.all([
      prisma.task.findMany({ where: { projectId } }),
      prisma.bug.findMany({ where: { projectId } }),
      prisma.activityLog.findMany({
        where: { projectId },
        orderBy: { createdAt: "asc" },
        take: 200,
      }),
    ]);

    // Task stats
    const taskStats = {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === "DONE").length,
      inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
      testing: tasks.filter((t) => t.status === "TESTING").length,
      todo: tasks.filter((t) => t.status === "TODO").length,
      backlog: tasks.filter((t) => t.status === "BACKLOG").length,
      completionRate: tasks.length > 0 ? Math.round((tasks.filter((t) => t.status === "DONE").length / tasks.length) * 100) : 0,
    };

    // Bug stats
    const bugStats = {
      total: bugs.length,
      open: bugs.filter((b) => b.status === "OPEN").length,
      inProgress: bugs.filter((b) => b.status === "IN_PROGRESS").length,
      resolved: bugs.filter((b) => b.status === "RESOLVED").length,
      closed: bugs.filter((b) => b.status === "CLOSED").length,
      critical: bugs.filter((b) => b.severity === "CRITICAL").length,
      major: bugs.filter((b) => b.severity === "MAJOR").length,
      minor: bugs.filter((b) => b.severity === "MINOR").length,
      fixRate: bugs.length > 0 ? Math.round(((bugs.filter((b) => b.status === "RESOLVED" || b.status === "CLOSED").length) / bugs.length) * 100) : 0,
    };

    // Weekly productivity (last 7 days)
    const now = new Date();
    const weeklyData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd   = new Date(date.setHours(23, 59, 59, 999));
      const label = dayStart.toLocaleDateString("en-US", { weekday: "short" });

      const tasksCreated  = activities.filter((a) => a.entityType === "TASK" && a.action === "created"  && new Date(a.createdAt) >= dayStart && new Date(a.createdAt) <= dayEnd).length;
      const tasksResolved = activities.filter((a) => a.entityType === "TASK" && a.action === "moved"    && new Date(a.createdAt) >= dayStart && new Date(a.createdAt) <= dayEnd).length;
      const bugsReported  = activities.filter((a) => a.entityType === "BUG"  && a.action === "reported" && new Date(a.createdAt) >= dayStart && new Date(a.createdAt) <= dayEnd).length;
      const bugsResolved  = activities.filter((a) => a.entityType === "BUG"  && a.action === "resolved" && new Date(a.createdAt) >= dayStart && new Date(a.createdAt) <= dayEnd).length;

      return { label, tasksCreated, tasksResolved, bugsReported, bugsResolved };
    });

    // Upcoming deadlines (next 7 days)
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingDeadlines = tasks
      .filter((t) => t.dueDate && new Date(t.dueDate) > now && new Date(t.dueDate) <= in7Days && t.status !== "DONE")
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 5)
      .map((t) => ({
        id: t.id,
        title: t.title,
        dueDate: t.dueDate,
        daysLeft: Math.ceil((new Date(t.dueDate!).getTime() - now.getTime()) / 86400000),
        priority: t.priority,
        status: t.status,
      }));

    // Success metrics
    const successMetrics = {
      avgCompletionTime: 0, // placeholder
      bugsResolvedThisWeek: activities.filter((a) => {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return a.entityType === "BUG" && a.action === "resolved" && new Date(a.createdAt) >= weekAgo;
      }).length,
      tasksCompletedThisWeek: activities.filter((a) => {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return a.entityType === "TASK" && a.action === "created" && new Date(a.createdAt) >= weekAgo;
      }).length,
      totalActivities: activities.length,
    };

    res.json({
      success: true,
      data: { taskStats, bugStats, weeklyData, upcomingDeadlines, successMetrics },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Start Server ───
const PORT = parseInt(process.env.PORT || "5000", 10);

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`
  🚀 Student Bug Tracker API
  ──────────────────────────
  🌐 Server:    http://0.0.0.0:${PORT}
  📡 Socket.io: ws://0.0.0.0:${PORT}
  🏥 Health:    http://0.0.0.0:${PORT}/api/v1/health
  📚 Database:  PostgreSQL (Prisma)
  ──────────────────────────
  `);
});

export { io };
