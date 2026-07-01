const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// =====================
// GAME STATE
// =====================
let gameOver = false;

// =====================
// GROUND
// =====================
const ground = {
  x: 0,
  y: 130,
  w: 800,
  h: 50,
};

// =====================
// PLAYER
// =====================
let playerX = 50;
let playerY = ground.y - 30;
let playerWidth = 30;
let playerHeight = 30;
let jumpVelocity = 0;

let player = {
  x: playerX,
  y: playerY,
  w: playerWidth,
  h: playerHeight,
  vy: 0,
  jumping: false,
};

// =====================
// PHYSICS
// =====================
const gravity = 0.6;
const enemySpeed = 1;

// =====================
// OBSTACLES
// =====================
let obstacles = [
  { x: 400, y: ground.y - 20, w: 20, h: 20 },
  { x: 650, y: ground.y - 50, w: 15, h: 50 },
  { x: 900, y: ground.y - 40, w: 12, h: 40 },
  { x: 1150, y: ground.y - 15, w: 10, h: 15 },
];

window.onload = function () {
  draw();

  requestAnimationFrame(update);

  document.addEventListener("keydown", jump);
};

// =====================
// UPDATE
// =====================
function update() {
  
  requestAnimationFrame(update);

  for (let i = 0; i < obstacles.length; i++) {
    obstacles[i].x -= enemySpeed;
    if (obstacles[i].x + obstacles[i].w < 0) {
      obstacles[i].x = 1150;
      console.log(obstacles[i].x)
    }
  }

  if (gameOver) {
    return;
  }

  //PLAYER
  jumpVelocity += gravity;
  player.y = Math.min(player.y + jumpVelocity, playerY);
  //console.log(player.y)
  if(player.y === playerY)
  {
    jumping = false;
  }

  draw();
}

// =====================
// JUMP
// =====================
function jump(e) {
  if (gameOver) {
    return;
  }

  if ((e.code == "Space" || e.code == "ArrowUp") && player.y === playerY) {
    jumping = true;
    jumpVelocity = -10;
    console.log("jump");
  }
}

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
  const obsticaleimg = new Image();
  obsticaleimg.src = "img/cactus1.png";
  for (let i = 0; i < obstacles.length; i++) {
    ctx.drawImage(
      obsticaleimg,
      obstacles[i].x,
      obstacles[i].y,
      obstacles[i].w,
      obstacles[i].h,
    );
  }
}
function drawPlayer() {
  const playerimg = new Image();
  playerimg.src = "img/dino.png";
  ctx.drawImage(playerimg, player.x, player.y, player.w, player.h);
  //console.log(player.y)
}

function drawGround() {
  ctx.fillStyle = "#67e14ec7";
  ctx.fillRect(ground.x, ground.y, ground.w, ground.h);
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
      return true;
    }
  }
  return false;
}

// =====================
// LOOP
// =====================
function loop() {
  //update();
  draw();
  requestAnimationFrame(loop);
}

loop();
