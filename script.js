// Initialize Console //
eruda.init();

// Setup Canvas //
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

// Set Canvas Size //
canvas.width = innerWidth;
canvas.height = innerHeight;
gameSpeed = 1.0; // at 1.0 one real-life second is one in-game second
lastRender = 0;
gameStarted = false;

// Pixel Art Filter //
ctx.imageSmoothingEnabled = false;

// Add Map and Player //
const map = new Map(32, 32);
const player = new Player(100, 100);

// Input //
const keyboard = {};

// When everything is loaded, wait for gesture by user to start game //
function onLoad() {
  initGraphics();
  initControls();
	window.addEventListener('resize', onResize)
  requestAnimationFrame(drawPleaseDoGesture);
}

function drawPleaseDoGesture() {
  ctx.font = "50px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "white"
  ctx.fillText("click", canvas.width / 2, canvas.height / 2);
}

// Game Start //
function startGame() {
  gameStarted = true;
  initAudio();
  requestAnimationFrame(Update);
}

// Game Loop //
function Update(timestamp) {
  let dur = fpsCalculation(timestamp);
  playerMovement();
  gameUpdate(dur);
  draw(dur);
  requestAnimationFrame(Update);
}

function gameUpdate(dur) {
  player.update(dur);
}

// FPS Calculation //
function fpsCalculation(timestamp) {
	dur = 0.001 * (timestamp - lastRender) 
  // if the game is worse than 10 FPS, it will actually slow to at max 0.1 in-game-seconds per frame and will give some warning
  if (dur > 0.1) { 
    console.log("really bad, this frame took " + dur + " seconds to finish")
    dur = 0.1
  }
	lastRender = timestamp
	return dur * gameSpeed;
}

function setGameSpeed(val) {
  setSlowModeSound((1.0 - val) * 0.1, 200 * val)
  gameSpeed = val;
}

const onResize = () => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
  ctx.imageSmoothingEnabled = false;
	updateStereoVariables()
}


// Run game when site loads //
window.onload = onLoad;