import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../types';

const userSelect = { id: true, name: true, email: true, avatar: true, role: true };

export const getProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).user!.userId;
    const projects = await prisma.project.findMany({
      where: { OR: [{ ownerId: userId }, { members: { some: { userId } } }] },
      include: {
        owner: { select: userSelect },
        members: { include: { user: { select: userSelect } } },
        _count: { select: { bugs: true, members: true, tasks: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
    res.json({ success: true, data: projects });
  } catch (err) { next(err); }
};

export const getProjectById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = (req as any).params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: { select: userSelect },
        members: { include: { user: { select: userSelect } } },
        _count: { select: { bugs: true, tasks: true } },
      },
    });
    if (!project) { res.status(404).json({ success: false, error: 'Project not found' }); return; }
    res.json({ success: true, data: project });
  } catch (err) { next(err); }
};

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description } = (req as any).body;
    const ownerId = (req as AuthRequest).user!.userId;

    const project = await prisma.project.create({
      data: { name, description, ownerId },
      include: {
        owner: { select: userSelect },
        _count: { select: { bugs: true, members: true } },
      },
    });
    res.status(201).json({ success: true, data: project });
  } catch (err) { next(err); }
};

export const updateProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = (req as any).params;
    const { name, description } = (req as any).body;
    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
      },
      include: { owner: { select: userSelect } },
    });
    res.json({ success: true, data: project });
  } catch (err) { next(err); }
};

export const deleteProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = (req as any).params;
    await prisma.project.delete({ where: { id } });
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) { next(err); }
};

export const joinProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { inviteCode } = (req as any).body;
    const userId = (req as AuthRequest).user!.userId;
    const userRole = (req as AuthRequest).user!.role;

    const project = await prisma.project.findUnique({ where: { inviteCode } });
    if (!project) { res.status(404).json({ success: false, error: 'Invalid invite code' }); return; }

    // Check already member
    const existing = await prisma.projectMember.findFirst({
      where: { projectId: project.id, userId },
    });
    if (existing) { res.json({ success: true, data: project, message: 'Already a member' }); return; }

    await prisma.projectMember.create({
      data: { projectId: project.id, userId, role: userRole },
    });

    const updated = await prisma.project.findUnique({
      where: { id: project.id },
      include: {
        owner: { select: userSelect },
        members: { include: { user: { select: userSelect } } },
        _count: { select: { bugs: true, members: true } },
      },
    });

    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};

export const addMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = (req as any).params;
    const { userId, role } = (req as any).body;
    const member = await prisma.projectMember.create({
      data: { projectId: id, userId, role },
      include: { user: { select: userSelect } },
    });
    res.status(201).json({ success: true, data: member });
  } catch (err) { next(err); }
};

export const removeMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, userId } = (req as any).params;
    await prisma.projectMember.deleteMany({
      where: { projectId: id, userId },
    });
    res.json({ success: true, message: 'Member removed' });
  } catch (err) { next(err); }
};
