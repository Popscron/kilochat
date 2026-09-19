import { io, type Socket } from 'socket.io-client';

import { API_URL } from './config';
import { emitUnauthorized, getSessionId, getToken } from './client';
import { addMessage, type StoreMessage } from '@/data/store';

let socket: Socket | null = null;

export function connectSocket() {
  disconnectSocket();
  const token = getToken();
  if (!token) return;

  socket = io(API_URL, {
    auth: { token },
    transports: ['websocket'],
  });

  socket.on('message:new', (message: StoreMessage) => {
    addMessage(message);
  });

  socket.on('session:revoked', (payload: { sessionId?: string }) => {
    if (payload?.sessionId && payload.sessionId === getSessionId()) emitUnauthorized();
  });
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
