const canvas = document.getElementById("game")
const ctx = canvas.getContext("2d")
const startOverlay = document.getElementById("startOverlay")
const gameOverOverlay = document.getElementById("gameOverOverlay")
const scoreEl = document.getElementById("score")
const finalScoreEl = document.getElementById("finalScore")
const finallhighScoreEl = document.getElementById("finallhighScore")
const highScoreEl = document.getElementById("highScore")
const jumpSound = document.getElementById("jumpSound")
const gameoverSound = document.getElementById("gameoverSound")
const pointSound = document.getElementById("pointSound")
const volControl = document.getElementById("volumeControl")

console.log(jumpSound, gameoverSound, pointSound)

let msPrev = window.performance.now()
const fps = 60
const msPerFrame = 1000 / fps
let frames = 0

// =====================
// GAME STATE
// =====================
let gameState = "idle" // idle, playing, gameover
let score = 0
let scoreTimer = 0
let scoreSound = 0
let lastSpawn = 0
let nextSpawnInterval = 1500
let lastTimestamp = 0
let animationId = null
let gameSpeed = 8
let highScore = Number(localStorage.getItem("player_ghostHighScore") || 0)
let isDragging = false;

// =====================
// GROUND
// =====================
const GROUND = {
  x: 0,
  y: 440,
  w: 800,
  h: 0,
}

// =====================
// PLAYER
// =====================
const player = {
  x: 50,
  y: GROUND.y - 90,
  w: 90,
  h: 90,
  groundY: GROUND.y - 40,
  vy: 0,
  isJumping: false,
}

// =====================
// PHYSICS
// =====================
const GRAVITY = 0.8
const JUMP_FORCE = -19

// =====================
// OBSTACLES
// =====================
let obstacles = []

window.onload = function () {
  canvas.width = 800
  canvas.height = 500
  let highScore = Number(localStorage.getItem("player_ghostHighScore") || 0)
  const savedVolume = localStorage.getItem("gameVolume") || 0.5
  volControl.value = savedVolume
  pointSound.volume = savedVolume
  jumpSound.volume = savedVolume
  gameoverSound.volume = savedVolume
  draw()
  document.addEventListener("keydown", handleKeydown)

  canvas.addEventListener("mousedown", handleTap)
  canvas.addEventListener("touchstart", handleTap, { passive: false })
}

// =====================
// VOLUME CONTROL
// =====================
volControl.addEventListener("mousedown", () => {
    isDragging = true;
});

volControl.addEventListener("mousemove", (e) => {
    if (isDragging) {
        updateVolumes(e.target.value);
    }
});

window.addEventListener("mouseup", () => {
    isDragging = false;
});

function updateVolumes(value) {
    pointSound.volume = value;
    jumpSound.volume = value;
    gameoverSound.volume = value;
    console.log("Volume is now: " + value);
}


function handleTap(e) {
  e.preventDefault()
  if (gameState === "idle" || gameState === "gameover") startGame()
  else jump()
}

function jump() {
  if (!player.isJumping && gameState === "playing") {
    player.vy = JUMP_FORCE
    player.isJumping = true
    jumpSound.play()
  }
}

//===================
//  START/END GAME
//===================
function startGame() {
  gameState = "playing"
  score = 0
  scoreTimer = 0
  scoreSound = 0
  gameSpeed = 8
  obstacles = []
  lastSpawn = performance.now()
  lastTimestamp = 0
  nextSpawnInterval = randomSpawnInterval()
  player.y = player.groundY
  player.vy = 0
  player.isJumping = false
  scoreEl.textContent = "0"
  startOverlay.classList.add("hidden")
  gameOverOverlay.classList.add("hidden")

  animationId = requestAnimationFrame(loop)
}

function endGame() {
  gameState = "gameover"
  cancelAnimationFrame(animationId)
  finalScoreEl.textContent = score
  highScoreEl.textContent = highScore
  finallhighScoreEl.textContent = highScore

  if (score > highScore) {
    highScore = score
    localStorage.setItem("player_ghostHighScore", highScore)
  }

  gameOverOverlay.classList.remove("hidden")
  gameoverSound.play()
}

//=============================
// PLAYER UPDATE WRT GRAVITY
//==============================
function updatePlayer() {
  player.vy += GRAVITY
  player.y += player.vy
  if (player.y >= player.groundY) {
    player.y = player.groundY
    player.isJumping = false
    player.vy = 0
  }
}

//=====================
// OBSTACLE SPAWN / UPDATE
//=====================
function randomSpawnInterval() {
  const base = 1000 + Math.random() * 1000
  return base * (8 / gameSpeed)
}

const enemy_type = {
  spike:    { w: 75,  h: 135 },
  skeleton: { w: 60,  h: 100 },
  spider:   { w: 80,  h: 60  },
}

function spawnObstacle() {
  const names = Object.keys(enemy_type)
  const type = names[Math.floor(Math.random() * names.length)]
  const { w, h } = enemy_type[type]
  obstacles.push({
    x: canvas.width,
    y: GROUND.y - h  + 60,
    w: w,
    h: h,
    type: type,
    passed: false,
  })
}

function updateObstacles() {
  gameSpeed += 0.001
  for (const obs of obstacles) {
    obs.x -= gameSpeed
  }

  obstacles = obstacles.filter((obs) => obs.x + obs.w > 0)
}

const playerImg = new Image()
playerImg.src = "img/player_ghost.png"

const obstacleImg = new Image()
obstacleImg.src = "img/spike_enemy.png"

const obstacleImg2 = new Image()
obstacleImg2.src = "img/skeleton_enemy.png"

const obstacleImg3 = new Image()
obstacleImg3.src = "img/spider_enemy.png"

// =====================
// DRAW
// =====================
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  drawPlayer()
  drawObstacles()
}

function drawObstacles() {
  const IMAGES = {
    spike: obstacleImg,
    skeleton: obstacleImg2,
    spider: obstacleImg3,
  }
  for (const obs of obstacles) {
    const img = IMAGES[obs.type]
    if (img) ctx.drawImage(img, obs.x, obs.y, obs.w, obs.h)
  }
}


function drawPlayer() {
  ctx.drawImage(playerImg, player.x, player.y, player.w, player.h)
}

// =====================
// COLLISION
// =====================
function detectCollision() {
  const pad = 20
  for (const obs of obstacles) {
    if (
      player.x + pad < obs.x + obs.w &&
      player.x + player.w - pad > obs.x &&
      player.y + pad < obs.y + obs.h &&
      player.y + player.h - pad > obs.y
    ) {
      endGame()
      return
    }
  }
}

// =====================
// SCORE
// =====================
function updateScore(delta) {
  scoreTimer += delta
  if (scoreTimer >= 100) {
    score += 1
    highScore = Math.max(highScore, score)
    scoreTimer = 0
    scoreSound += 1
    if (scoreSound === 100) {
      pointSound.play()
      scoreSound = 0
    }
    scoreEl.textContent = score
    console.log(scoreSound)
  }
}

// =====================
// LOOP
// =====================
function loop(timestamp) {
  if (gameState !== "playing") return

  const msPassed = timestamp - msPrev
  if (msPassed < msPerFrame) {
    animationId = requestAnimationFrame(loop)
    return
  }
  msPrev = timestamp

  const delta = msPassed

  updatePlayer()
  updateObstacles()

  if (timestamp - lastSpawn >= nextSpawnInterval) {
    spawnObstacle()
    lastSpawn = timestamp
    nextSpawnInterval = randomSpawnInterval()
  }

  detectCollision()
  updateScore(delta)

  draw()

  frames++
  animationId = requestAnimationFrame(loop)
}

// =====================
// KEYBOARD INPUT
// =====================
function handleKeydown(e) {
  if (e.code === "Space" || e.code === "ArrowUp") {
    e.preventDefault()
    if (gameState === "idle") startGame()
    else if (gameState === "gameover") startGame()
    else jump()
  }
}

