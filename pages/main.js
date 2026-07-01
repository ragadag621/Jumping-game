const canvas = document.getElementById("game")
const ctx = canvas.getContext("2d")

// =====================
// GAME STATE
// =====================
let gameOver = false

// =====================
// GROUND
// =====================
const ground = {
  x: 0,
  y: 130,
  w: 800,
  h: 50,
}

// =====================
// PLAYER
// =====================
let player = {
  x: 50,
  y: ground.y - 30,
  w: 30,
  h: 30,
  vy: 0,
  jumping: false,
}

// =====================
// PHYSICS
// =====================
const gravity = 0.7

// =====================
// OBSTACLES
// =====================
let obstacles = [
  { x: 400, y: ground.y - 20, w: 20, h: 20 },
  { x: 650, y: ground.y - 50, w: 15, h: 50 },
  { x: 900, y: ground.y - 40, w: 12, h: 40 },
  { x: 1150, y: ground.y - 15, w: 10, h: 15 },
]

window.onload = function()
{
    requestAnimationFrame(update)

    draw();
}

// =====================
// UPDATE
// =====================
function update()
{
    requestAnimationFrame(update)

    if(gameOver)
    {
        return;
    }

    draw()
}

// =====================
// JUMP
// =====================


// =====================
// DRAW
// =====================
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  drawGround()
  drawPlayer()
  drawObstacle()
}
function drawObstacle(obstacle) {
  const obsticaleimg = new Image()
  obsticaleimg.src = "img/cactus1.png"
  for (let i = 0; i < obstacles.length; i++) {
    ctx.drawImage(
      obsticaleimg,
      obstacles[i].x,
      obstacles[i].y,
      obstacles[i].w,
      obstacles[i].h,
    )
  }
}
function drawPlayer() {
    const playerimg = new Image()
    playerimg.src = "img/dino.png"
    ctx.drawImage(playerimg, player.x, player.y, player.w, player.h)
}

function drawGround() {
  ctx.fillStyle = "#67e14ec7"
  ctx.fillRect(ground.x, ground.y, ground.w, ground.h)
}

// =====================
// COLLISION
// =====================




// =====================
// LOOP
// =====================
// function loop() {
//   //update()
//   draw()
//   requestAnimationFrame(loop)
// }

// loop()
