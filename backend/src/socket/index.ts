// @ts-nocheck
import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../lib/jwt';
import { logger } from '../lib/logger';

let io: Server;

export const initSocket = (server: HttpServer): Server => {
  io = new Server(server, {
    cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const payload = verifyAccessToken(token);
      (socket as any).user = payload;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    logger.info(`Socket connected: ${socket.id} (user: ${user?.userId})`);

    socket.join(`user:${user.userId}`);

    socket.on('join:project', (projectId: string) => {
      socket.join(`project:${projectId}`);
    });
    socket.on('leave:project', (projectId: string) => socket.leave(`project:${projectId}`));
    socket.on('join:bug', (bugId: string) => socket.join(`bug:${bugId}`));
    socket.on('leave:bug', (bugId: string) => socket.leave(`bug:${bugId}`));

    socket.on('typing:start', ({ bugId }: { bugId: string }) => {
      socket.to(`bug:${bugId}`).emit('typing:update', { userId: user.userId, isTyping: true });
    });
    socket.on('typing:stop', ({ bugId }: { bugId: string }) => {
      socket.to(`bug:${bugId}`).emit('typing:update', { userId: user.userId, isTyping: false });
    });

    socket.on('disconnect', () => logger.info(`Socket disconnected: ${socket.id}`));
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

export const emitToProject = (projectId: string, event: string, data: unknown): void =>
  void getIO().to(`project:${projectId}`).emit(event, data);

export const emitToUser = (userId: string, event: string, data: unknown): void =>
  void getIO().to(`user:${userId}`).emit(event, data);

export const emitToBug = (bugId: string, event: string, data: unknown): void =>
  void getIO().to(`bug:${bugId}`).emit(event, data);
