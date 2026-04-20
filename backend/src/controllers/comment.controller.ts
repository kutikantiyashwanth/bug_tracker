// @ts-nocheck
import { Request, Response, NextFunction } from 'express'; = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bugId, taskId } = (req as any).params;
    const { content } = (req as any).body;
    const userId = (req as AuthRequest).user!.userId;

    const comment = await prisma.comment.create({
      data: {
        content,
        userId,
        ...(bugId && { bugId }),
        ...(taskId && { taskId }),
      },
      include: { user: { select: userSelect } },
    });

    res.status(201).json({ success: true, data: comment });
  } catch (err) { next(err); }
};

export const getComments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bugId, taskId } = (req as any).params;
    const where: any = {};
    if (bugId) where.bugId = bugId;
    if (taskId) where.taskId = taskId;

    const comments = await prisma.comment.findMany({
      where,
      include: { user: { select: userSelect } },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ success: true, data: comments });
  } catch (err) { next(err); }
};

export const updateComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = (req as any).params;
    const { content } = (req as any).body;
    const userId = (req as AuthRequest).user!.userId;

    const existing = await prisma.comment.findUnique({ where: { id } });
    if (!existing) { res.status(404).json({ success: false, error: 'Comment not found' }); return; }
    if (existing.userId !== userId) { res.status(403).json({ success: false, error: 'Forbidden' }); return; }

    const comment = await prisma.comment.update({
      where: { id },
      data: { content },
      include: { user: { select: userSelect } },
    });

    res.json({ success: true, data: comment });
  } catch (err) { next(err); }
};

export const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = (req as any).params;
    const userId = (req as AuthRequest).user!.userId;
    const role = (req as AuthRequest).user!.role;

    const existing = await prisma.comment.findUnique({ where: { id } });
    if (!existing) { res.status(404).json({ success: false, error: 'Comment not found' }); return; }
    if (existing.userId !== userId && role !== 'ADMIN') {
      res.status(403).json({ success: false, error: 'Forbidden' }); return;
    }

    await prisma.comment.delete({ where: { id } });
    res.json({ success: true, message: 'Comment deleted' });
  } catch (err) { next(err); }
};
