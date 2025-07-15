
import { Server as SocketIOServer } from 'socket.io';

let io;

export const initSocket = (server) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*', 
    },
  });

  io.on('connection', (socket) => {
    // console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
      // console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

