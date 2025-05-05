const socket = io();
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const upBtn = document.getElementById('upBtn');
const downBtn = document.getElementById('downBtn');
const player1Score = document.getElementById('player1Score');
const player2Score = document.getElementById('player2Score');

// Set canvas size
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let players = {};
let ball = { x: 0, y: 0 };
let scores = { player1: 0, player2: 0 };
let myRole = null;

// Touch controls
upBtn.addEventListener('touchstart', moveUp);
upBtn.addEventListener('mousedown', moveUp);
downBtn.addEventListener('touchstart', moveDown);
downBtn.addEventListener('mousedown', moveDown);

function moveUp(e) {
  e.preventDefault();
  if (myRole) socket.emit('move', -15);
}

function moveDown(e) {
  e.preventDefault();
  if (myRole) socket.emit('move', 15);
}

// Prevent scrolling
document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

// Handle player assignment
socket.on('role', (role) => {
  myRole = role;
  document.body.classList.add(role);
});

// Game state update
socket.on('update', (data) => {
  players = data.players;
  ball = data.ball;
  scores = data.scores;

  player1Score.textContent = scores.player1;
  player2Score.textContent = scores.player2;

  draw();
});

// Draw game (scaled for mobile)
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';

  const scaleX = canvas.width / 600;
  const scaleY = canvas.height / 400;

  // Draw paddles
  if (players.player1) {
    ctx.fillRect(
      10 * scaleX, 
      players.player1.y * scaleY, 
      10 * scaleX, 
      100 * scaleY
    );
  }
  if (players.player2) {
    ctx.fillRect(
      canvas.width - 20 * scaleX, 
      players.player2.y * scaleY, 
      10 * scaleX, 
      100 * scaleY
    );
  }

  // Draw ball
  ctx.beginPath();
  ctx.arc(
    ball.x * scaleX, 
    ball.y * scaleY, 
    10 * Math.min(scaleX, scaleY), 
    0, 
    Math.PI * 2
  );
  ctx.fill();
}