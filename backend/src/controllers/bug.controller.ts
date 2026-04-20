// @ts-nocheck
import { Request, Response, NextFunction } from 'express'; = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId } = (req as any).params;
    const { status, severity, search } = (req as any).query;

    const where: any = { projectId };
    if (status) where.status = status.toUpperCase();
    if (severity) where.severity = severity.toUpperCase();
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const bugs = await prisma.bug.findMany({
      where,
      include: {
        reporter: { select: userSelect },
        assignee: { select: userSelect },
        comments: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: bugs });
  } catch (err) { next(err); }
};

export const getBugById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = (req as any).params;
    const bug = await prisma.bug.findUnique({
      where: { id },
      include: {
        reporter: { select: userSelect },
        assignee: { select: userSelect },
        comments: {
          include: { user: { select: userSelect } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!bug) { res.status(404).json({ success: false, error: 'Bug not found' }); return; }
    res.json({ success: true, data: bug });
  } catch (err) { next(err); }
};

export const createBug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId } = (req as any).params;
    const { title, description, severity, assigneeId, stepsToReproduce, screenshotUrl } = (req as any).body;
    const userId = (req as AuthRequest).user!.userId;

    const bug = await prisma.bug.create({
      data: {
        title,
        description,
        severity: severity?.toUpperCase() || 'MAJOR',
        projectId,
        reporterId: userId,
        assigneeId: assigneeId || undefined,
        stepsToReproduce,
        screenshotUrl,
      },
      include: {
        reporter: { select: userSelect },
        assignee: { select: userSelect },
      },
    });

    // Notify assignee
    if (assigneeId) {
      await prisma.notification.create({
        data: {
          userId: assigneeId,
          type: 'BUG_ASSIGNED',
          title: 'New bug assigned to you',
          message: `You have been assigned to bug: "${title}"`,
        },
      }).catch(() => {});
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'reported',
        entityType: 'BUG',
        entityId: bug.id,
        details: `Reported bug: ${title}`,
        projectId,
        userId,
      },
    }).catch(() => {});

    res.status(201).json({ success: true, data: bug });
  } catch (err) { next(err); }
};

export const updateBug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = (req as any).params;
    const { title, description, status, severity, assigneeId, stepsToReproduce, screenshotUrl } = (req as any).body;
    const userId = (req as AuthRequest).user!.userId;

    const existing = await prisma.bug.findUnique({ where: { id } });
    if (!existing) { res.status(404).json({ success: false, error: 'Bug not found' }); return; }

    const bug = await prisma.bug.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status: status.toUpperCase() }),
        ...(severity && { severity: severity.toUpperCase() }),
        ...(assigneeId !== undefined && { assigneeId: assigneeId || null }),
        ...(stepsToReproduce !== undefined && { stepsToReproduce }),
        ...(screenshotUrl !== undefined && { screenshotUrl }),
      },
      include: {
        reporter: { select: userSelect },
        assignee: { select: userSelect },
      },
    });

    // Log status change
    if (status && status.toUpperCase() !== existing.status) {
      await prisma.activityLog.create({
        data: {
          action: 'moved',
          entityType: 'BUG',
          entityId: id,
          details: `Bug status changed to ${status}`,
          projectId: existing.projectId,
          userId,
        },
      }).catch(() => {});
    }

    res.json({ success: true, data: bug });
  } catch (err) { next(err); }
};

export const deleteBug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = (req as any).params;
    await prisma.bug.delete({ where: { id } });
    res.json({ success: true, message: 'Bug deleted' });
  } catch (err) { next(err); }
};
