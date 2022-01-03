import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import { Server, ServerOptions } from 'socket.io';

import Game from '@/models/game';

dotenv.config();

const app = express();
const server = http.createServer(app);

const options: Partial<ServerOptions> = {
  cors: {
    origin: 'http://localhost:3000',
  },
};

const io = new Server(server, options);

const game = new Game(io);

io.on('connection', (socket) => {
  console.log('user connected', socket.id);

  socket.on('app.setPlayer', () => {
    game.setPlayer(socket.id);
  })

  socket.on('app.play', ({ x, y }) => {
    game.play({ x, y });
  });

  socket.on('app.reset', () => {
    game.resetGame();
  });

  socket.on('disconnect', () => {
    console.log('user disconnected', socket.id);

    game.unsetPlayer(socket.id);
  })
});

server.listen(3333, () => {
  console.log('listening on *:3333');
});
