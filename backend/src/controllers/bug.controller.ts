import { Response, NextFunction } from 'express';
import { Prisma, BugStatus, BugPriority, BugSeverity } from '@prisma/client';
import prisma from '../lib/prisma';
import { cacheGet, cacheSet, cacheDel, cacheDelPattern, CacheKeys } from '../lib/redis';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest, BugFilterQuery } from '../types';
import { emitToProject, emitToBug } from '../socket';

const BUG_SELECT = {
  id: true, title: true, description: true, status: true,
  priority: true, severity: true, dueDate: true, resolvedAt: true,
  stepsToRepro: true, environment: true, version: true,
  createdAt: true, updatedAt: true,
  reporter: { select: { id: true, name: true, username: true, avatarUrl: true } },
  assignee: { select: { id: true, name: true, username: true, avatarUrl: true } },
  labels: { include: { label: true } },
  _count: { select: { comments: true, attachments: true } },
};

export const getBugs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params;
    const {
      page = '1', limit = '20', status, priority, severity,
      assigneeId, reporterId, search, labelIds, sortBy = 'createdAt', sortOrder = 'desc',
    } = req.query as BugFilterQuery;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const cacheKey = CacheKeys.bugList(projectId, JSON.stringify(req.query));
    const cached = await cacheGet(cacheKey);
    if (cached) { res.json({ success: true, ...cached }); return; }

    const where: Prisma.BugWhereInput = { projectId };
    if (status) where.status = status as BugStatus;
    if (priority) where.priority = priority as BugPriority;
    if (severity) where.severity = severity as BugSeverity;
    if (assigneeId) where.assigneeId = assigneeId;
    if (reporterId) where.reporterId = reporterId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (labelIds) {
      const ids = labelIds.split(',');
      where.labels = { some: { labelId: { in: ids } } };
    }

    const orderBy: Prisma.BugOrderByWithRelationInput = { [sortBy]: sortOrder };

    const [bugs, total] = await Promise.all([
      prisma.bug.findMany({ where, select: BUG_SELECT, orderBy, skip, take: limitNum }),
      prisma.bug.count({ where }),
    ]);

    const result = {
      data: bugs,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    };
    await cacheSet(cacheKey, result, 60);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

export const getBugById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const cached = await cacheGet(CacheKeys.bug(id));
    if (cached) { res.json({ success: true, data: cached }); return; }

    const bug = await prisma.bug.findUnique({
      where: { id },
      include: {
        reporter: { select: { id: true, name: true, username: true, avatarUrl: true } },
        assignee: { select: { id: true, name: true, username: true, avatarUrl: true } },
        labels: { include: { label: true } },
        comments: {
          where: { parentId: null },
          include: {
            author: { select: { id: true, name: true, username: true, avatarUrl: true } },
            replies: {
              include: { author: { select: { id: true, name: true, username: true, avatarUrl: true } } },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        activities: {
          include: { user: { select: { id: true, name: true, username: true } } },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        attachments: true,
      },
    });
    if (!bug) throw new AppError('Bug not found', 404);

    await cacheSet(CacheKeys.bug(id), bug, 120);
    res.json({ success: true, data: bug });
  } catch (err) { next(err); }
};

export const createBug = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params;
    const { title, description, priority, severity, assigneeId, dueDate, stepsToRepro, environment, version, labelIds } = req.body;

    const bug = await prisma.bug.create({
      data: {
        title, description, priority, severity,
        projectId, reporterId: req.user!.userId,
        assigneeId, dueDate: dueDate ? new Date(dueDate) : undefined,
        stepsToRepro, environment, version,
        ...(labelIds?.length && { labels: { create: labelIds.map((labelId: string) => ({ labelId })) } }),
      },
      include: {
        reporter: { select: { id: true, name: true, username: true, avatarUrl: true } },
        assignee: { select: { id: true, name: true, username: true, avatarUrl: true } },
        labels: { include: { label: true } },
      },
    });

    await cacheDelPattern(`bugs:${projectId}:*`);
    emitToProject(projectId, 'bug:created', bug);

    if (assigneeId) {
      await prisma.notification.create({
        data: {
          userId: assigneeId, type: 'BUG_ASSIGNED',
          title: 'New bug assigned to you',
          message: `You have been assigned to: "${title}"`,
          metadata: { bugId: bug.id, projectId },
        },
      });
    }

    res.status(201).json({ success: true, data: bug });
  } catch (err) { next(err); }
};

export const updateBug = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const existing = await prisma.bug.findUnique({ where: { id } });
    if (!existing) throw new AppError('Bug not found', 404);

    const statusChanged = updates.status && updates.status !== existing.status;

    const bug = await prisma.bug.update({
      where: { id },
      data: {
        ...updates,
        dueDate: updates.dueDate ? new Date(updates.dueDate) : undefined,
        resolvedAt: updates.status === 'RESOLVED' ? new Date() : undefined,
        closedAt: updates.status === 'CLOSED' ? new Date() : undefined,
      },
      include: {
        reporter: { select: { id: true, name: true, username: true, avatarUrl: true } },
        assignee: { select: { id: true, name: true, username: true, avatarUrl: true } },
        labels: { include: { label: true } },
      },
    });

    if (statusChanged) {
      await prisma.bugActivity.create({
        data: {
          bugId: id, userId: req.user!.userId,
          action: 'STATUS_CHANGED', field: 'status',
          oldValue: existing.status, newValue: updates.status,
        },
      });
    }

    await Promise.all([cacheDel(CacheKeys.bug(id)), cacheDelPattern(`bugs:${existing.projectId}:*`)]);
    emitToProject(existing.projectId, 'bug:updated', bug);
    emitToBug(id, 'bug:updated', bug);

    res.json({ success: true, data: bug });
  } catch (err) { next(err); }
};

export const deleteBug = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const bug = await prisma.bug.findUnique({ where: { id } });
    if (!bug) throw new AppError('Bug not found', 404);

    await prisma.bug.delete({ where: { id } });
    await Promise.all([cacheDel(CacheKeys.bug(id)), cacheDelPattern(`bugs:${bug.projectId}:*`)]);
    emitToProject(bug.projectId, 'bug:deleted', { id });
    res.json({ success: true, message: 'Bug deleted' });
  } catch (err) { next(err); }
};

export const getBugStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params;
    const [statusCounts, priorityCounts, recentBugs] = await Promise.all([
      prisma.bug.groupBy({ by: ['status'], where: { projectId }, _count: { status: true } }),
      prisma.bug.groupBy({ by: ['priority'], where: { projectId }, _count: { priority: true } }),
      prisma.bug.findMany({
        where: { projectId }, orderBy: { createdAt: 'desc' }, take: 5,
        select: { id: true, title: true, status: true, priority: true, createdAt: true },
      }),
    ]);
    res.json({ success: true, data: { statusCounts, priorityCounts, recentBugs } });
  } catch (err) { next(err); }
};
