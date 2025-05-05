const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.static('public'));

let players = {};
let ball = {
  x: 300,
  y: 200,
  vx: 4,
  vy: 4
};
let scores = { player1: 0, player2: 0 };

function resetBall(scorer) {
  if (scorer === 'player1') scores.player1++;
  if (scorer === 'player2') scores.player2++;

  ball = {
    x: 300,
    y: 200,
    vx: (Math.random() > 0.5 ? 4 : -4),
    vy: (Math.random() > 0.5 ? 4 : -4)
  };
}

function gameLoop() {
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Wall collision
  if (ball.y <= 0 || ball.y >= 400) ball.vy *= -1;

  // Paddle collision
  const p1 = players.player1;
  const p2 = players.player2;

  if (p1 && ball.x <= 20 && ball.y >= p1.y && ball.y <= p1.y + 100) {
    ball.vx = Math.abs(ball.vx) * 1.05; // Speed up slightly
  }

  if (p2 && ball.x >= 580 && ball.y >= p2.y && ball.y <= p2.y + 100) {
    ball.vx = -Math.abs(ball.vx) * 1.05;
  }

  // Scoring
  if (ball.x <= 0) resetBall('player2');
  if (ball.x >= 600) resetBall('player1');

  io.emit('update', { players, ball, scores });
}

setInterval(gameLoop, 1000 / 60);

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  // Assign player
  if (!players.player1) {
    players.player1 = { id: socket.id, y: 150 };
    socket.emit('role', 'player1');
  } else if (!players.player2) {
    players.player2 = { id: socket.id, y: 150 };
    socket.emit('role', 'player2');
  } else {
    socket.emit('role', 'spectator');
  }

  socket.on('move', (dir) => {
    if (players.player1?.id === socket.id) {
      players.player1.y = Math.max(0, Math.min(300, players.player1.y + dir));
    } else if (players.player2?.id === socket.id) {
      players.player2.y = Math.max(0, Math.min(300, players.player2.y + dir));
    }
  });

  socket.on('disconnect', () => {
    if (players.player1?.id === socket.id) delete players.player1;
    if (players.player2?.id === socket.id) delete players.player2;
    console.log('Player disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});