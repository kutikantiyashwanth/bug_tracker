import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (token: string): Socket => {
  if (socket?.connected) return socket;

  // Disconnect stale socket before creating a new one
  if (socket) { socket.disconnect(); socket = null; }

  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
    auth: { token },
    // Prefer WebSocket — falls back to polling only if WS is blocked
    transports: ['websocket', 'polling'],
    // Keep connection alive
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 500,
    reconnectionDelayMax: 3000,
    // Reduce latency: disable upgrade delay
    upgrade: true,
    rememberUpgrade: true,
    // Timeout
    timeout: 5000,
  });

  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) { socket.disconnect(); socket = null; }
};

export const getExistingSocket = (): Socket | null => socket;
