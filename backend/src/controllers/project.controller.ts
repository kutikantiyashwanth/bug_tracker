import { Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { cacheGet, cacheSet, cacheDel, CacheKeys } from '../lib/redis';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';

export const getProjects = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const cached = await cacheGet(CacheKeys.projectList(userId));
    if (cached) { res.json({ success: true, data: cached }); return; }

    const projects = await prisma.project.findMany({
      where: { OR: [{ ownerId: userId }, { members: { some: { userId } } }, { isPublic: true }] },
      include: {
        owner: { select: { id: true, name: true, username: true, avatarUrl: true } },
        _count: { select: { bugs: true, members: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    await cacheSet(CacheKeys.projectList(userId), projects, 120);
    res.json({ success: true, data: projects });
  } catch (err) { next(err); }
};

export const getProjectById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const cached = await cacheGet(CacheKeys.project(id));
    if (cached) { res.json({ success: true, data: cached }); return; }

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, username: true, avatarUrl: true } },
        members: { include: { user: { select: { id: true, name: true, username: true, avatarUrl: true, role: true } } } },
        labels: true,
        _count: { select: { bugs: true } },
      },
    });
    if (!project) throw new AppError('Project not found', 404);

    await cacheSet(CacheKeys.project(id), project, 300);
    res.json({ success: true, data: project });
  } catch (err) { next(err); }
};

export const createProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description, isPublic } = req.body;
    const ownerId = req.user!.userId;
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();

    const project = await prisma.project.create({
      data: { name, slug, description, isPublic: isPublic ?? false, ownerId },
      include: {
        owner: { select: { id: true, name: true, username: true, avatarUrl: true } },
        _count: { select: { bugs: true, members: true } },
      },
    });

    await cacheDel(CacheKeys.projectList(ownerId));
    res.status(201).json({ success: true, data: project });
  } catch (err) { next(err); }
};

export const updateProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, description, isPublic } = req.body;
    const project = await prisma.project.update({
      where: { id },
      data: { name, description, isPublic },
      include: {
        owner: { select: { id: true, name: true, username: true, avatarUrl: true } },
        _count: { select: { bugs: true, members: true } },
      },
    });
    await cacheDel(CacheKeys.project(id), CacheKeys.projectList(req.user!.userId));
    res.json({ success: true, data: project });
  } catch (err) { next(err); }
};

export const deleteProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.project.delete({ where: { id } });
    await cacheDel(CacheKeys.project(id), CacheKeys.projectList(req.user!.userId));
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) { next(err); }
};

export const addMember = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.body;
    const member = await prisma.projectMember.create({
      data: { projectId: id, userId, role },
      include: { user: { select: { id: true, name: true, username: true, avatarUrl: true } } },
    });
    await cacheDel(CacheKeys.project(id));
    res.status(201).json({ success: true, data: member });
  } catch (err) { next(err); }
};

export const removeMember = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id, userId } = req.params;
    await prisma.projectMember.delete({ where: { projectId_userId: { projectId: id, userId } } });
    await cacheDel(CacheKeys.project(id));
    res.json({ success: true, message: 'Member removed' });
  } catch (err) { next(err); }
};

export const createLabel = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;
    const label = await prisma.label.create({ data: { name, color, projectId: id } });
    await cacheDel(CacheKeys.project(id));
    res.status(201).json({ success: true, data: label });
  } catch (err) { next(err); }
};
