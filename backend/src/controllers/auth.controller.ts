// @ts-nocheck
import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { signAccessToken } from '../lib/jwt';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      throw new AppError('Name, email and password are required', 400);
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError('Email already in use', 409);

    const hashed = await bcrypt.hash(password, 12);

    // Map frontend role values to schema enum
    const roleMap: Record<string, 'ADMIN' | 'DEVELOPER' | 'TESTER'> = {
      admin: 'ADMIN',
      developer: 'DEVELOPER',
      tester: 'TESTER',
      ADMIN: 'ADMIN',
      DEVELOPER: 'DEVELOPER',
      TESTER: 'TESTER',
    };
    const mappedRole = roleMap[role] || 'DEVELOPER';

    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: mappedRole },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    const token = signAccessToken({ userId: user.id, email: user.email, role: user.role });

    res.status(201).json({ success: true, data: { user, token } });
  } catch (err) { next(err); }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError('Invalid credentials', 401);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new AppError('Invalid credentials', 401);

    const token = signAccessToken({ userId: user.id, email: user.email, role: user.role });

    const { password: _, ...safeUser } = user;
    res.json({ success: true, data: { user: safeUser, token } });
  } catch (err) { next(err); }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true, email: true, name: true,
        role: true, avatar: true, skills: true, createdAt: true,
      },
    });
    if (!user) throw new AppError('User not found', 404);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  res.json({ success: true, message: 'Logged out successfully' });
};
