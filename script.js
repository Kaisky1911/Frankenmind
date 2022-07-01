// < > |

// Setup Canvas //

const canvasBack = document.getElementById("layer0");
const ctxBack = canvasBack.getContext("2d");

const canvas = document.getElementById("layer1");
const ctx = canvas.getContext("2d");

const canvasTop = document.getElementById("layer2");
const ctxTop = canvasTop.getContext("2d");

// Set Canvas Size //
canvas.width = innerWidth;
canvas.height = innerHeight;
gameSpeed = 1.0; // at 1.0 one real-life second is one in-game second
lastRender = 0;
gameStarted = false;
levelEditorEnabled = true;

const map = new Map();
var player;
var ball;
new Player(200, 200);
new Ball(200, 200 + Ball.ropeLength);
var isInCombat = false;

var gameObjClasses = {
    "Player": Player,
    "Ball": Ball,
    "Bat": Bat,
    "GameEvent": GameEvent,
}

// Pixel Art Filter //     
ctxBack.imageSmoothingEnabled = false;
ctx.imageSmoothingEnabled = false;
ctxTop.imageSmoothingEnabled = false;

// Input //
const keyboard = {};

// When everything is loaded, wait for gesture by user to start game //
function onLoad() {
    initGraphics();
    initMainMenuControls();
    resize();
	window.addEventListener('resize', resize)
    requestAnimationFrame(drawMainMenu);
}

function drawMainMenu() {
    ctxBack.clearRect(0, 0, canvasBack.width, canvasBack.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctxTop.clearRect(0, 0, canvasTop.width, canvasTop.height);
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (menuControls != null) {
        ctx.fillStyle = "grey"
        ctx.fillRect(0, menuControls.selection * canvas.height / 2, canvas.width, canvas.height / 2);
    }

    ctx.font = "50px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "white"
    ctx.fillText("suffer from start", canvas.width / 2, canvas.height / 2 - 50);
    ctx.fillText("continue suffering", canvas.width / 2, canvas.height / 2 + 50);
    requestAnimationFrame(drawMainMenu);
}

// Game Start //
function startGame() {
    canvasTop.width = window.innerWidth;
    canvasTop.height = window.innerHeight;
    ctxTop.imageSmoothingEnabled = false;
    initControls();
    initAudio();
    initGameEvents();
    gameStarted = true;
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

    isInCombat = false;
    map.update(dur);
    if (isInCombat) updateMusic("battle")
    else updateMusic("default")

    if (saveGameAtEndThisFrameFlag) actuallySaveGame();
}

// FPS Calculation //
function fpsCalculation(timestamp) {
	dur = 0.001 * (timestamp - lastRender) 
    // if the game is worse than 10 FPS, it will actually slow to at max 0.1 in-game-seconds per frame
    if (dur > 0.1) { 
        dur = 0.1
    }
	lastRender = timestamp
	return dur * gameSpeed;
}

function setGameSpeed(val) {
    setSlowModeSound((1.0 - val) * 0.1, 200 * val)
    gameSpeed = val;
}

const resize = () => {
	canvasBack.width = window.innerWidth;
	canvasBack.height = window.innerHeight;
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
    canvasTop.width = window.innerWidth;
    if (gameStarted) {
        canvasTop.height = window.innerHeight;
    }
    else {
        canvasTop.height = 0;
    }
    ctxBack.imageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
    ctxTop.imageSmoothingEnabled = false;
	updateStereoVariables()
}

// Run game when site loads //
window.onload = onLoad;