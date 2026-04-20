// @ts-nocheck
import { Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';

export const getUserById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = (req as any).params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true,
        avatar: true, role: true, skills: true, createdAt: true,
        _count: { select: { reportedBugs: true, assignedBugs: true } },
      },
    });
    if (!user) throw new AppError('User not found', 404);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, avatar, skills } = (req as any).body;
    const userId = req.user!.userId;
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(avatar && { avatar }),
        ...(skills && { skills }),
      },
      select: { id: true, name: true, email: true, avatar: true, role: true, skills: true, updatedAt: true },
    });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

export const searchUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { q } = (req as any).query as { q: string };
    if (!q || q.length < 2) { res.json({ success: true, data: [] }); return; }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { id: true, name: true, email: true, avatar: true, role: true },
      take: 10,
    });
    res.json({ success: true, data: users });
  } catch (err) { next(err); }
};
