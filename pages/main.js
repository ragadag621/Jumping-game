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
  h: 1
};

// =====================
// PLAYER
// =====================
let player = {
  x: 50,
  y: ground.y - 30,
  w: 30,
  h: 30,
  vy: 0,
  jumping: false
};

// =====================
// PHYSICS
// =====================
const gravity = 0.7;

// =====================
// OBSTACLES
// =====================
let obstacles = [
  { x: 400, y: ground.y - 20, w: 20, h: 20 },
  { x: 650, y: ground.y - 50, w: 15, h: 50 },
  { x: 900, y: ground.y - 40, w: 12, h: 40 },
  { x: 1150, y: ground.y - 15, w: 10, h: 15 }
];

// =====================
// INPUT
// =====================
  



// =====================
// JUMP
// =====================




// =====================
// COLLISION
// =====================




// =====================
// UPDATE
// =====================


// =====================
// DRAW
// =====================



// =====================
// LOOP
// =====================
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();

