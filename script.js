const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const playPauseBtn = document.getElementById('play-pause');

const tileSize = 24;
const gridSize = canvas.width / tileSize;

let snake;
let direction;
let nextDirection;
let food;
let score;
let gameLoopId = null;
let lastFrame = 0;
const speed = 120; // ms per frame
let isPaused = true;

function initGame() {
  snake = [
    { x: Math.floor(gridSize / 2) - 1, y: Math.floor(gridSize / 2) },
    { x: Math.floor(gridSize / 2) - 2, y: Math.floor(gridSize / 2) },
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { ...direction };
  score = 0;
  updateScore();
  spawnFood();
  isPaused = true;
  cancelAnimationFrame(gameLoopId);
  lastFrame = 0;
  draw();
  showOverlay('Pressione espaço para jogar');
  playPauseBtn.textContent = '▶';
}

function showOverlay(message) {
  overlayTitle.textContent = message;
  overlay.hidden = false;
}

function hideOverlay() {
  overlay.hidden = true;
}

function updateScore() {
  scoreEl.textContent = score.toString();
}

function spawnFood() {
  const available = [];
  for (let x = 0; x < gridSize; x += 1) {
    for (let y = 0; y < gridSize; y += 1) {
      if (!snake.some((segment) => segment.x === x && segment.y === y)) {
        available.push({ x, y });
      }
    }
  }
  food = available[Math.floor(Math.random() * available.length)];
}

function setDirection(x, y) {
  if (direction.x === -x && direction.y === -y) {
    return;
  }
  nextDirection = { x, y };
}

function handleKeydown(event) {
  switch (event.key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      setDirection(0, -1);
      event.preventDefault();
      break;
    case 'ArrowDown':
    case 's':
    case 'S':
      setDirection(0, 1);
      event.preventDefault();
      break;
    case 'ArrowLeft':
    case 'a':
    case 'A':
      setDirection(-1, 0);
      event.preventDefault();
      break;
    case 'ArrowRight':
    case 'd':
    case 'D':
      setDirection(1, 0);
      event.preventDefault();
      break;
    case ' ':
    case 'Enter':
      if (isPaused) {
        startGame();
      } else {
        pauseGame();
      }
      event.preventDefault();
      break;
    default:
      break;
  }
}

document.addEventListener('keydown', handleKeydown);
playPauseBtn.addEventListener('click', () => {
  if (isPaused) {
    startGame();
  } else {
    pauseGame();
  }
});

function startGame() {
  if (!isPaused) return;
  isPaused = false;
  hideOverlay();
  playPauseBtn.textContent = '⏸';
  lastFrame = performance.now();
  gameLoopId = requestAnimationFrame(loop);
}

function pauseGame() {
  if (isPaused) return;
  isPaused = true;
  playPauseBtn.textContent = '▶';
  showOverlay('Jogo pausado');
  cancelAnimationFrame(gameLoopId);
}

function endGame() {
  isPaused = true;
  playPauseBtn.textContent = '▶';
  showOverlay('Fim de jogo! Pressione espaço para reiniciar.');
  cancelAnimationFrame(gameLoopId);
}

function loop(timestamp) {
  if (isPaused) return;
  const delta = timestamp - lastFrame;
  if (delta > speed) {
    update();
    draw();
    lastFrame = timestamp;
  }
  gameLoopId = requestAnimationFrame(loop);
}

function update() {
  direction = nextDirection;
  const newHead = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  if (
    newHead.x < 0 ||
    newHead.x >= gridSize ||
    newHead.y < 0 ||
    newHead.y >= gridSize ||
    snake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)
  ) {
    endGame();
    return;
  }

  snake.unshift(newHead);

  if (newHead.x === food.x && newHead.y === food.y) {
    score += 1;
    updateScore();
    spawnFood();
  } else {
    snake.pop();
  }
}

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let x = 0; x < gridSize; x += 1) {
    for (let y = 0; y < gridSize; y += 1) {
      const offset = (x + y) % 2 === 0 ? '#aad751' : '#a2d149';
      ctx.fillStyle = offset;
      ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
    }
  }
}

function drawSnake() {
  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? 'var(--snake-head-color)' : 'var(--snake-color)';
    ctx.fillRect(segment.x * tileSize, segment.y * tileSize, tileSize, tileSize);

    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(
      segment.x * tileSize + 4,
      segment.y * tileSize + 4,
      tileSize - 8,
      tileSize - 8,
    );
  });

  const head = snake[0];
  ctx.fillStyle = '#fff';
  const eyeSize = 4;
  const eyeOffsetX = direction.x !== 0 ? (direction.x > 0 ? 6 : tileSize - 10) : 6;
  const eyeOffsetY = direction.y !== 0 ? (direction.y > 0 ? 6 : tileSize - 10) : 6;
  ctx.beginPath();
  ctx.arc(head.x * tileSize + eyeOffsetX, head.y * tileSize + 8, eyeSize, 0, Math.PI * 2);
  ctx.arc(head.x * tileSize + eyeOffsetX, head.y * tileSize + tileSize - 8, eyeSize, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1a1a1a';
  const pupilOffset = direction.x !== 0 ? (direction.x > 0 ? 2 : -2) : 0;
  const pupilOffsetY = direction.y !== 0 ? (direction.y > 0 ? 2 : -2) : 0;
  ctx.beginPath();
  ctx.arc(
    head.x * tileSize + eyeOffsetX + pupilOffset,
    head.y * tileSize + 8 + pupilOffsetY,
    eyeSize / 2,
    0,
    Math.PI * 2,
  );
  ctx.arc(
    head.x * tileSize + eyeOffsetX + pupilOffset,
    head.y * tileSize + tileSize - 8 + pupilOffsetY,
    eyeSize / 2,
    0,
    Math.PI * 2,
  );
  ctx.fill();
}

function drawFood() {
  const radius = tileSize / 2;
  const centerX = food.x * tileSize + radius;
  const centerY = food.y * tileSize + radius;

  const gradient = ctx.createRadialGradient(
    centerX - 4,
    centerY - 4,
    radius / 3,
    centerX,
    centerY,
    radius,
  );
  gradient.addColorStop(0, '#ff7875');
  gradient.addColorStop(1, 'var(--food-color)');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius - 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#58a700';
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - radius + 6);
  ctx.lineTo(centerX + 6, centerY - radius - 4);
  ctx.lineTo(centerX + 2, centerY - radius + 2);
  ctx.closePath();
  ctx.fill();
}

function draw() {
  drawBoard();
  drawSnake();
  drawFood();
}

initGame();
