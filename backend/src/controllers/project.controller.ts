import { Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';

export const getProjects = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const projects = await prisma.project.findMany({
      where: { OR: [{ ownerId: userId }, { members: { some: { userId } } }] },
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        members: { include: { user: { select: { id: true, name: true, email: true, avatar: true, role: true } } } },
        _count: { select: { bugs: true, members: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
    res.json({ success: true, data: projects });
  } catch (err) { next(err); }
};

export const getProjectById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = (req as any).params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        members: { include: { user: { select: { id: true, name: true, email: true, avatar: true, role: true } } } },
        _count: { select: { bugs: true } },
      },
    });
    if (!project) throw new AppError('Project not found', 404);
    res.json({ success: true, data: project });
  } catch (err) { next(err); }
};

export const createProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description } = (req as any).body;
    const ownerId = req.user!.userId;

    const project = await prisma.project.create({
      data: { name, description, ownerId },
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        _count: { select: { bugs: true, members: true } },
      },
    });
    res.status(201).json({ success: true, data: project });
  } catch (err) { next(err); }
};

export const updateProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = (req as any).params;
    const { name, description } = (req as any).body;
    const project = await prisma.project.update({
      where: { id },
      data: { ...(name && { name }), ...(description !== undefined && { description }) },
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        _count: { select: { bugs: true, members: true } },
      },
    });
    res.json({ success: true, data: project });
  } catch (err) { next(err); }
};

export const deleteProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = (req as any).params;
    await prisma.project.delete({ where: { id } });
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) { next(err); }
};

export const addMember = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = (req as any).params;
    const { userId, role } = (req as any).body;
    const member = await prisma.projectMember.create({
      data: { projectId: id, userId, role },
      include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
    });
    res.status(201).json({ success: true, data: member });
  } catch (err) { next(err); }
};

export const removeMember = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id, userId } = (req as any).params;
    await prisma.projectMember.delete({ where: { projectId_userId: { projectId: id, userId } } });
    res.json({ success: true, message: 'Member removed' });
  } catch (err) { next(err); }
};
