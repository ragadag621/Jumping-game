// =====================
// DOM ELEMENTS
// =====================
const gameWrapper = document.querySelector(".game-wrapper");
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const startOverlay = document.getElementById("startOverlay");
const gameOverOverlay = document.getElementById("gameOverOverlay");
const scoreEl = document.getElementById("score");
const finalScoreEl = document.getElementById("finalScore");
const finalHighScoreEl = document.getElementById("finalHighScore");
const highScoreEl = document.getElementById("highScore");
const jumpSound = document.getElementById("jumpSound");
const gameoverSound = document.getElementById("gameoverSound");
const pointSound = document.getElementById("pointSound");

// One independent slider per sound effect
const jumpVolumeControl = document.getElementById("jumpVolume");
const pointVolumeControl = document.getElementById("pointVolume");
const gameoverVolumeControl = document.getElementById("gameoverVolume");

// Set DEBUG to true to draw hitboxes on top of the sprites
const DEBUG = false;

const CANVAS_W = 800;
const CANVAS_H = 500;

// =====================
// TIMING
// =====================
let msPrev = window.performance.now();
const fps = 60;
const msPerFrame = 1000 / fps;
let frames = 0;

// =====================
// GAME STATE
// =====================
let gameState = "idle"; // idle, playing, gameover
let score = 0;
let scoreSound = 0;
let lastSpawn = 0;
let nextSpawnInterval = 1500;
let animationId = null;
let gameSpeed = 8;
let highScore = Number(localStorage.getItem("player_ghostHighScore") || 0);

let bgOffset = 0;
const BG_PARALLAX_FACTOR = 1; // background moves slower than obstacles = depth

// =====================
// GROUND
// =====================
const GROUND = {
  x: 0,
  y: 440,
  w: 800,
  h: 0,
};

// =====================
// PLAYER
// =====================
const player = {
  x: 50,
  y: GROUND.y - 150,
  w: 120,
  h: 120,
  groundY: GROUND.y - 60,
  vy: 0,
  isJumping: false,
};

let currentFrame = 0;
let frameTimer = 0;

const FRAME_DELAY = 100;

// =====================
// PHYSICS
// =====================
const GRAVITY = 0.8;
const JUMP_FORCE = -19;

// =====================
// OBSTACLES
// =====================
let obstacles = [];

const enemy_type = {
  spike: { w: 75, h: 135 },
  skeleton: { w: 50, h: 100 },
  RIP: { w: 90, h: 90 },
};

// =====================
// SPRITES
// =====================
const playerImg = new Image();
playerImg.src = "img/ghost.png";

const skeletonEnemyImg = new Image();
skeletonEnemyImg.src = "img/skeleton_enemy.png";

const RIPImg = new Image();
RIPImg.src = "img/RIP.png";

const spikeImg = new Image();
spikeImg.src = "img/spike_enemy.png";

const bgImg = new Image();
bgImg.src = "img/Bg1.png";
let bgTileWidth = 0;
bgImg.onload = () => {
  bgTileWidth = (bgImg.naturalWidth / bgImg.naturalHeight) * CANVAS_H;
  if (gameState !== "playing") draw();
};

// =====================
// INIT
// =====================
window.onload = function () {
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;

  highScoreEl.textContent = highScore;

  setupVolumeSlider(jumpVolumeControl, jumpSound, "jumpVolume");
  setupVolumeSlider(pointVolumeControl, pointSound, "pointVolume");
  setupVolumeSlider(gameoverVolumeControl, gameoverSound, "gameoverVolume");

  draw();

  document.addEventListener("keydown", handleKeydown);
  gameWrapper.addEventListener("mousedown", handleTap);
  gameWrapper.addEventListener("touchstart", handleTap, { passive: false });
};

// =====================
// VOLUME CONTROL
// =====================

function setupVolumeSlider(sliderEl, audioEl, storageKey) {
  const savedVolume = localStorage.getItem(storageKey) ?? 0.5;
  sliderEl.value = savedVolume;
  audioEl.volume = savedVolume;

  sliderEl.addEventListener("input", (e) => {
    audioEl.volume = e.target.value;
    localStorage.setItem(storageKey, e.target.value);
  });
}

// =====================
// INPUT
// =====================
function handleTap(e) {
  if (e.target.closest("input, label")) return;

  e.preventDefault();
  if (gameState === "idle" || gameState === "gameover") startGame();
  else jump();
}

function handleKeydown(e) {
  if (e.code === "Space" || e.code === "ArrowUp") {
    e.preventDefault();
    if (gameState === "idle" || gameState === "gameover") startGame();
    else jump();
  }
}

function jump() {
  if (!player.isJumping && gameState === "playing") {
    player.vy = JUMP_FORCE;
    player.isJumping = true;
    jumpSound.play();
  }
}

// =====================
// START / END GAME
// =====================
function startGame() {
  gameState = "playing";
  score = 0;
  scoreSound = 0;
  gameSpeed = 8;
  bgOffset = 0;
  obstacles = [];
  lastSpawn = performance.now();
  nextSpawnInterval = randomSpawnInterval();
  player.y = player.groundY;
  player.vy = 0;
  player.isJumping = false;

  scoreEl.textContent = "0";
  startOverlay.classList.add("hidden");
  gameOverOverlay.classList.add("hidden");

  animationId = requestAnimationFrame(loop);
}

function endGame() {
  gameState = "gameover";
  cancelAnimationFrame(animationId);

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("player_ghostHighScore", highScore);
  }

  finalScoreEl.textContent = score;
  highScoreEl.textContent = highScore;
  finalHighScoreEl.textContent = highScore;

  gameOverOverlay.classList.remove("hidden");
  gameoverSound.play();
}

// =====================
// PLAYER UPDATE (gravity)
// =====================
function updatePlayer() {
  player.vy += GRAVITY;
  player.y += player.vy;
  if (player.y >= player.groundY) {
    player.y = player.groundY;
    player.isJumping = false;
    player.vy = 0;
  }
}

function updateAnimation(delta) {
  frameTimer += delta;
  if (frameTimer >= FRAME_DELAY) {
    currentFrame = (currentFrame + 1) % 6;
    frameTimer = 0;
  }
}

// =====================
// OBSTACLE SPAWN / UPDATE
// =====================
function randomSpawnInterval() {
  const base = 1000 + Math.random() * 1000;
  return base * (8 / gameSpeed);
}

function spawnObstacle() {
  const names = Object.keys(enemy_type);
  const type = names[Math.floor(Math.random() * names.length)];
  const { w, h } = enemy_type[type];

  obstacles.push({
    x: canvas.width,
    y: GROUND.y - h / 2,
    w: w,
    h: h,
    type: type,
    passed: false,
  });
}

function updateObstacles() {
  if(gameSpeed < 10)
  {
    gameSpeed += 0.001;
  }
  // gameSpeed += 0.001;
  for (const obs of obstacles) {
    obs.x -= gameSpeed;
  }
  obstacles = obstacles.filter((obs) => obs.x + obs.w > 0);
}

function updateBackground() {
  bgOffset += gameSpeed * BG_PARALLAX_FACTOR;
}

// =====================
// DRAW
// =====================
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawPlayer();
  drawObstacles();
}

function mod(n, m) {
  return ((n % m) + m) % m;
}

function drawBackground() {
  if (!bgTileWidth) return; // image not loaded yet

  const scrolledIntoTile = mod(bgOffset, bgTileWidth);
  const firstTileIndex = Math.floor(bgOffset / bgTileWidth);

  let x = -scrolledIntoTile;
  let tileIndex = firstTileIndex;

  while (x < canvas.width) {
    drawBackgroundTile(x, tileIndex);
    x += bgTileWidth;
    tileIndex++;
  }
}

function drawBackgroundTile(x, tileIndex) {
  ctx.save();
  if (tileIndex % 2 !== 0) {
    ctx.translate(x + bgTileWidth, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(bgImg, 0, 0, bgTileWidth, canvas.height);
  } else {
    ctx.drawImage(bgImg, x, 0, bgTileWidth, canvas.height);
  }
  ctx.restore();
}

function drawPlayer() {
  ctx.drawImage(
    playerImg,
    currentFrame * 190 - 10,
    5,
    150,
    130,
    player.x,
    player.y,
    player.w,
    player.h,
  );

  if (DEBUG) {
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.strokeRect(player.x, player.y, player.w, player.h);
  }
}

function drawObstacles() {
  for (const obs of obstacles) {
    if (obs.type === "spike") {
      ctx.drawImage(spikeImg, obs.x, obs.y, obs.w, obs.h);
    } else if (obs.type === "skeleton") {
      ctx.drawImage(skeletonEnemyImg, obs.x, obs.y, obs.w, obs.h);
    } else if (obs.type === "RIP") {
      ctx.drawImage(RIPImg, obs.x, obs.y, obs.w, obs.h);
    }

    if (DEBUG) {
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
    }
  }
}

// =====================
// COLLISION
// =====================
function detectCollision() {
  const pad = 20; // shrink hitbox slightly so it feels more fair
  for (const obs of obstacles) {
    if (
      player.x + pad < obs.x + obs.w &&
      player.x + player.w - pad > obs.x &&
      player.y + pad < obs.y + obs.h &&
      player.y + player.h - pad > obs.y
    ) {
      endGame();
      return;
    }
  }
}

// =====================
// SCORE
// =====================
function updateScore() {
  for (const obs of obstacles) {
    if (!obs.passed && player.x > obs.x + obs.w) {
      obs.passed = true;
      score += 1;
      highScore = Math.max(highScore, score);
      scoreEl.textContent = score;

      scoreSound += 1;
      if (scoreSound === 100) {
        pointSound.play();
        scoreSound = 0;
      }
    }
  }
}

// =====================
// MAIN LOOP
// =====================
function loop(timestamp) {
  if (gameState !== "playing") return;

  const msPassed = timestamp - msPrev;
  if (msPassed < msPerFrame) {
    animationId = requestAnimationFrame(loop);
    return;
  }
  msPrev = timestamp;

  const delta = msPassed;

  updatePlayer();
  updateAnimation(delta);
  updateObstacles();
  updateBackground();

  if (timestamp - lastSpawn >= nextSpawnInterval) {
    spawnObstacle();
    lastSpawn = timestamp;
    nextSpawnInterval = randomSpawnInterval();
  }

  detectCollision();
  updateScore();
  draw();

  frames++;
  animationId = requestAnimationFrame(loop);
  console.log(gameSpeed)
}
