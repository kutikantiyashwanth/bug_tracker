import { Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { cacheGet, cacheSet, cacheDel, CacheKeys } from '../lib/redis';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';

export const getUserById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const cached = await cacheGet(CacheKeys.user(id));
    if (cached) { res.json({ success: true, data: cached }); return; }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, username: true, email: true,
        avatarUrl: true, bio: true, role: true, createdAt: true,
        _count: { select: { reportedBugs: true, assignedBugs: true } },
      },
    });
    if (!user) throw new AppError('User not found', 404);

    await cacheSet(CacheKeys.user(id), user, 300);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, bio, avatarUrl } = req.body;
    const userId = req.user!.userId;
    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, bio, avatarUrl },
      select: { id: true, name: true, username: true, email: true, avatarUrl: true, bio: true, role: true, updatedAt: true },
    });
    await cacheDel(CacheKeys.user(userId));
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

export const searchUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { q } = req.query as { q: string };
    if (!q || q.length < 2) { res.json({ success: true, data: [] }); return; }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { username: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
        isActive: true,
      },
      select: { id: true, name: true, username: true, avatarUrl: true, role: true },
      take: 10,
    });
    res.json({ success: true, data: users });
  } catch (err) { next(err); }
};
