const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const startOverlay = document.getElementById("startOverlay");
const gameOverOverlay = document.getElementById("gameOverOverlay");
const scoreEl = document.getElementById("score");
const finalScoreEl = document.getElementById("finalScore");
const gameoverSound = document.getElementById("gameoverSound"); 

// =====================
// GAME STATE
// =====================
let gameState = "idle"; // idle, playing, gameover
let gameOver = false;
let score = 0;
let scoreTimer = 0;
let lastSpawn = 0;
let animationId = null;

// =====================
// GROUND
// =====================
const GROUND = {
  x: 0,
  y: 130,
  w: 800,
  h: 0,
};

// =====================
// PLAYER
// =====================

const player = {
  x: 50,
  y: GROUND.y - 20,
  w: 35,
  h: 35,
  groundY: GROUND.y - 20,
  vy: 0,
  isJumping: false,
};


// =====================
// PHYSICS
// =====================
const GRAVITY = 0.6;
//const enemySpeed = 1;
const JUMP_FORCE = -12;
const OBSTACLE_SPEED = 5;
let SPAWN_INTERVAL =  1800;


// =====================
// OBSTACLES
// =====================
let obstacles = [];

window.onload = function () {
  draw();
  document.addEventListener("keydown", handleKeydown);
};

function jump() {
  if (!player.isJumping && gameState ==='playing') {
    player.vy = JUMP_FORCE;
    player.isJumping = true;
    //jumpSound.play();
    return;
  }
}


//===================
//  START/END GAME
//===================

function startGame() {
  gameState = "playing";
  score = 0;
  scoreTimer = 0;
  obstacles = [];
  lastSpawn = performance.now();
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
  finalScoreEl.textContent = score;
  gameOverOverlay.classList.remove("hidden");
  //gameoverSound.play();
}


//=============================
  //PLAYER UPDATE WRT GRAVITY
//==============================  
  function updatePlayer(delta) {  
   player.vy += GRAVITY;
   player.y += player.vy;
   if (player.y >= player.groundY) {
     player.y = player.groundY;
     player.isJumping = false;
     player.vy = 0;
   }
  }



//=====================
   //OBSTACLE UPDATE
//=====================


  function spawnObstacle() {
// g.iv - randomized height (optional)
// const height = 60 + Math.floor(Math.random() * 60); // 30–60px
// const width = 24 + Math.floor(Math.random() * 14);
const height = 60; // 30–60px
const width = 24;
obstacles.push({
  x: canvas.width,
  y: GROUND.y - 40,
  w: width,
  h: height,
  passed: false
});
}

function updateObstacles() {
  obstacles.forEach((obs) => {
    obs.x -= OBSTACLE_SPEED;
  });

  // Remove off-screen obstacles
  obstacles = obstacles.filter((obs) => obs.x + obs.w > 0);
}


const playerImg = new Image();
playerImg.src = "img/dino.png";

const obstacleImg = new Image();
obstacleImg.src = "img/cactus1.png";


// =====================
// DRAW
// =====================
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGround();
  drawPlayer();
  drawObstacle();
}
function drawObstacle(obstacle) {
  for (let i = 0; i < obstacles.length; i++) {
    ctx.drawImage(
      obstacleImg,
      obstacles[i].x,
      obstacles[i].y,
      obstacles[i].w,
      obstacles[i].h,
    );
  }
}
function drawPlayer() {
  ctx.drawImage(playerImg, player.x, player.y, player.w, player.h);
}

function drawGround() {
  ctx.fillStyle = "#67e14ec7";
  ctx.fillRect(GROUND.x, GROUND.y, GROUND.w, GROUND.h);
  
}

// =====================
// COLLISION
// =====================
// to be reviewed when enemies are moving...
function detectCollision() {

    for (let i = 0; i < obstacles.length; i++) {
      const enemy = obstacles[i];
      if (
        player.x < enemy.x + enemy.w &&
        player.x + player.w > enemy.x &&
        player.y < enemy.y + enemy.h &&
        player.y + player.h > enemy.y
      ) {
        console.log("Collide!")
        endGame();
      }
  }
}

// =====================
// LOOP
// =====================
function loop(timestamp) {
   if (gameState !== "playing") return;

  const delta = 16; // approx one frame

  updatePlayer(delta);
  updateObstacles();

  if (timestamp - lastSpawn >= SPAWN_INTERVAL) {
    spawnObstacle();
    lastSpawn = timestamp;
  }

  detectCollision();
  //updateScore(delta);
  draw();

  animationId = requestAnimationFrame(loop);
}

// =====================
    //KEYBOARD INPUT
// =====================

function handleKeydown(e) {
  if (e.code === "Space" || e.code === "ArrowUp") {
    e.preventDefault();
    if (gameState === "idle") startGame();
    else if (gameState === "gameover") startGame();
    else jump();
  }
}

// Initial draw
draw();