// @ts-nocheck
import { Request, Response, NextFunction } from 'express'; = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).user!.userId;

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.notification.count({ where: { userId, read: false } }),
    ]);

    res.json({ success: true, data: notifications, unreadCount });
  } catch (err) { next(err); }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = (req as any).params;
    const userId = (req as AuthRequest).user!.userId;
    await prisma.notification.update({
      where: { id },
      data: { read: true },
    });
    res.json({ success: true, message: 'Marked as read' });
  } catch (err) { next(err); }
};

export const markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).user!.userId;
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) { next(err); }
};
