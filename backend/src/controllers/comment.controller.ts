import { Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { cacheDel, CacheKeys } from '../lib/redis';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';
import { emitToBug } from '../socket';

export const addComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { bugId } = req.params;
    const { content, parentId } = req.body;

    const bug = await prisma.bug.findUnique({ where: { id: bugId } });
    if (!bug) throw new AppError('Bug not found', 404);

    const comment = await prisma.comment.create({
      data: { content, bugId, authorId: req.user!.userId, parentId },
      include: {
        author: { select: { id: true, name: true, username: true, avatarUrl: true } },
        replies: { include: { author: { select: { id: true, name: true, username: true, avatarUrl: true } } } },
      },
    });

    await cacheDel(CacheKeys.bug(bugId));
    emitToBug(bugId, 'comment:new', comment);

    if (bug.reporterId !== req.user!.userId) {
      await prisma.notification.create({
        data: {
          userId: bug.reporterId, type: 'COMMENT_ADDED',
          title: 'New comment on your bug',
          message: `Someone commented on "${bug.title}"`,
          metadata: { bugId, commentId: comment.id },
        },
      });
    }

    res.status(201).json({ success: true, data: comment });
  } catch (err) { next(err); }
};

export const updateComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const existing = await prisma.comment.findUnique({ where: { id } });
    if (!existing) throw new AppError('Comment not found', 404);
    if (existing.authorId !== req.user!.userId) throw new AppError('Forbidden', 403);

    const comment = await prisma.comment.update({
      where: { id },
      data: { content, isEdited: true },
      include: { author: { select: { id: true, name: true, username: true, avatarUrl: true } } },
    });

    await cacheDel(CacheKeys.bug(existing.bugId));
    emitToBug(existing.bugId, 'comment:updated', comment);
    res.json({ success: true, data: comment });
  } catch (err) { next(err); }
};

export const deleteComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const existing = await prisma.comment.findUnique({ where: { id } });
    if (!existing) throw new AppError('Comment not found', 404);
    if (existing.authorId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      throw new AppError('Forbidden', 403);
    }

    await prisma.comment.delete({ where: { id } });
    await cacheDel(CacheKeys.bug(existing.bugId));
    emitToBug(existing.bugId, 'comment:deleted', { id });
    res.json({ success: true, message: 'Comment deleted' });
  } catch (err) { next(err); }
};
