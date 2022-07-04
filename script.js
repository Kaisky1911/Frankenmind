// < > |

// Setup Canvas //

const canvasBack = document.getElementById("layer0");
const ctxBack = canvasBack.getContext("2d");

const canvasShadow = document.getElementById("layer1");
const ctxShadow = canvasShadow.getContext("2d");

const canvas = document.getElementById("layer2");
const ctx = canvas.getContext("2d");

const canvasTopShadow = document.getElementById("layer3");
const ctxTopShadow = canvasTopShadow.getContext("2d");

const canvasTop = document.getElementById("layer4");
const ctxTop = canvasTop.getContext("2d");

// Set Canvas Size //
canvas.width = innerWidth;
canvas.height = innerHeight;
gameSpeed = 1.0; // at 1.0 one real-life second is one in-game second
lastRender = 0;
gameStarted = false;
levelEditorEnabled = false;

var gameObjClasses = {
    "Player": Player,
    "Ball": Ball,
    "Bat": Bat,
    "Snake": Snake,
    "Rat": Rat,
    "Lizard": Lizard,
    "Fireball": Fireball,
    "Boulder": Boulder,
    "GameEvent": GameEvent,
    "Lever": Lever,
    "Heart": Heart,
    "Sign": Sign,
    "Save": Save,
    "LavaController": LavaController,
}

const map = new Map();
var player;
var ball;
var isInCombat = false;
var wasInCombat = false;
var endGameTimer = 0;
var clickToFocus = true;

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
    ctxShadow.clearRect(0, 0, canvasShadow.width, canvasShadow.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctxTop.clearRect(0, 0, canvasTop.width, canvasTop.height);
    ctxTopShadow.clearRect(0, 0, canvasTopShadow.width, canvasTopShadow.height);
    //ctx.fillStyle = "black"
    //ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (clickToFocus) {
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillStyle = "white"
        ctx.font = "50px pixelfont"
        ctx.fillText("click to focus so stupid browser", canvas.width / 2, canvas.height / 2 - 50);
        ctx.fillText("can start the MAIN MENU MUSIC", canvas.width / 2, canvas.height / 2 + 50);
        
    }
    else {
        let size = Math.min(canvas.width, canvas.height)
        let borderW = 0.5 * (canvas.width - size)
        ctx.drawImage(sprites["title"].img, 0.5 * canvas.width - 0.5 * size, 0, size, size);
    
    
    
        ctx.fillStyle = "rgba(0, 0, 0, 0.0)"
        ctx.fillRect(borderW + 200, canvas.height / 2 - 95, canvas.width - 2 * borderW - 400, 90)
        ctx.fillRect(borderW + 200, canvas.height / 2 + 5, canvas.width - 2 * borderW - 400, 90)
    
        
        ctx.font = "30px pixelfont"
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "white"
        ctx.strokeStyle = "black"
        ctx.lineWidth = 8.0;
    
        let yOff = 200;
        ctx.strokeText("Kaisky - Code, Game Design", 50, canvas.height - yOff);
        yOff -= 50;
        ctx.strokeText("Redstoneman_6000 - Art, Voice", 50, canvas.height - yOff);
        yOff -= 50;
        ctx.strokeText("HellenButterlips - Music, SFX, Level Design", 50, canvas.height - yOff);
        yOff -= 50;
        ctx.strokeText("made in HTML5", 50, canvas.height - yOff);
    
        yOff = 200;
        ctx.fillText("Kaisky - Code, Game Design", 50, canvas.height - yOff);
        yOff -= 50;
        ctx.fillText("Redstoneman_6000 - Art, Voice", 50, canvas.height - yOff);
        yOff -= 50;
        ctx.fillText("HellenButterlips - Music, SFX, Level Design", 50, canvas.height - yOff);
        yOff -= 50;
        ctx.fillText("made with plain javascript", 50, canvas.height - yOff);
    
        ctx.font = "50px pixelfont"
        ctx.textAlign = "center";
        ctx.strokeStyle = "red"
        
        
        if (menuControls != null && menuControls.selection == 0) ctx.strokeText("start new suffering", canvas.width / 2, canvas.height / 2 - 50);
        ctx.fillText("start new suffering", canvas.width / 2, canvas.height / 2 - 50);
    
        if (menuControls != null && menuControls.selection == 1) ctx.strokeText("load last suffering", canvas.width / 2, canvas.height / 2 + 50);
        ctx.fillText("load last suffering", canvas.width / 2, canvas.height / 2 + 50);
    }
    if(!gameStarted) requestAnimationFrame(drawMainMenu);
}

// Game Start //
function startGame() {
    canvasTop.width = window.innerWidth;
    canvasTop.height = window.innerHeight;
    ctxTop.imageSmoothingEnabled = false;

    canvasTopShadow.width = window.innerWidth;
    canvasTopShadow.height = window.innerHeight;
    ctxTopShadow.imageSmoothingEnabled = false;

    ctxShadow.globalAlpha = 0.3;
    ctxTopShadow.globalAlpha = 0.3;
    initControls();
    gameStarted = true;
    requestAnimationFrame(Update);
}

var frameRaterDivider = 1;
var frameRateDividerCounter = 0;

// Game Loop //
function Update(timestamp) {
    frameRateDividerCounter++;
    if (frameRateDividerCounter < frameRaterDivider) {
        requestAnimationFrame(Update);
        return;
    }
    frameRateDividerCounter = 0;
    let dur = fpsCalculation(timestamp);
    playerMovement();
    if (endGameTimer > 0) endGameTimer += dur;
    if (endGameTimer > 4) {
        ctx.drawImage(sprites["end"].img, 0, 0, canvas.width, canvas.height);
    }
    else {
        gameUpdate(dur);
        draw(dur);
    }
    requestAnimationFrame(Update);
}

function gameUpdate(dur) {

    wasInCombat = isInCombat;
    isInCombat = false;
    map.update(dur);
    if (endGameTimer != 0) updateMusic("win")
    else if (isInCombat) updateMusic("battle")
    else updateMusic("default")

    if (saveGameAtEndThisFrameFlag) actuallySaveGame();
    else if (loadGameAtEndThisFrameFlag) actuallyLoadGame();
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
    setSlowModeSound((1.0 - val) * 0.1, 200 * val + 50)
    gameSpeed = val;
}

const resize = () => {
	canvasBack.width = window.innerWidth;
	canvasBack.height = window.innerHeight;
	canvasShadow.width = window.innerWidth;
    canvasShadow.height = window.innerHeight;
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
    canvasTopShadow.width = window.innerWidth;
    canvasTop.width = window.innerWidth;
    if (gameStarted) {
        canvasTop.height = window.innerHeight;
        canvasTopShadow.height = window.innerHeight;
    }
    else {
        canvasTop.height = 0;
        canvasTopShadow.height = 0;
    }
    ctxBack.imageSmoothingEnabled = false;
    ctxShadow.imageSmoothingEnabled = false;
    ctxShadow.globalAlpha = 0.3;
    ctx.imageSmoothingEnabled = false;
    ctxTopShadow.imageSmoothingEnabled = false;
    ctxTopShadow.globalAlpha = 0.3;
    ctxTop.imageSmoothingEnabled = false;
	updateStereoVariables()
}

// Run game when site loads //
window.onload = onLoad;