const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const rooms = new Map();

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', ({ roomId, userName }) => {
    socket.join(roomId);
    socket.roomId = roomId;
    socket.userName = userName;

    if (!rooms.has(roomId)) {
      rooms.set(roomId, { users: new Map(), revealed: false, story: '' });
    }

    const room = rooms.get(roomId);
    room.users.set(socket.id, { name: userName, vote: null });

    io.to(roomId).emit('room-update', getRoomState(roomId));
    console.log(`${userName} joined room ${roomId}`);
  });

  socket.on('vote', (points) => {
    const room = rooms.get(socket.roomId);
    if (room && !room.revealed) {
      const user = room.users.get(socket.id);
      if (user) {
        user.vote = points;
        io.to(socket.roomId).emit('room-update', getRoomState(socket.roomId));
      }
    }
  });

  socket.on('reveal', () => {
    const room = rooms.get(socket.roomId);
    if (room) {
      room.revealed = true;
      io.to(socket.roomId).emit('room-update', getRoomState(socket.roomId));
    }
  });

  socket.on('reset', () => {
    const room = rooms.get(socket.roomId);
    if (room) {
      room.revealed = false;
      room.users.forEach(user => user.vote = null);
      io.to(socket.roomId).emit('room-update', getRoomState(socket.roomId));
    }
  });

  socket.on('set-story', (story) => {
    const room = rooms.get(socket.roomId);
    if (room) {
      room.story = story;
      io.to(socket.roomId).emit('room-update', getRoomState(socket.roomId));
    }
  });

  socket.on('disconnect', () => {
    if (socket.roomId && rooms.has(socket.roomId)) {
      const room = rooms.get(socket.roomId);
      room.users.delete(socket.id);
      if (room.users.size === 0) {
        rooms.delete(socket.roomId);
      } else {
        io.to(socket.roomId).emit('room-update', getRoomState(socket.roomId));
      }
    }
    console.log('User disconnected:', socket.id);
  });
});

function getRoomState(roomId) {
  const room = rooms.get(roomId);
  if (!room) return null;

  const users = [];
  room.users.forEach((user, id) => {
    users.push({
      id,
      name: user.name,
      hasVoted: user.vote !== null,
      vote: room.revealed ? user.vote : null
    });
  });

  return {
    users,
    revealed: room.revealed,
    story: room.story
  };
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Planning Poker running on port ${PORT}`);
});
