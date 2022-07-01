// < > |

var menuControls = {
	"mouseX": 0,
	"mouseY": 0,
	"selection": null
}

function initMainMenuControls() {
	canvas.addEventListener("mousedown", e => {
		if (e.button == 0) {
			if (menuControls.selection == 0) startGame();
			if (menuControls.selection == 1) {
				startGame();
				loadGame();
			}
		}
	});
	
	canvas.addEventListener("mousemove", e => {
		menuControls.mouseX = e.offsetX
		menuControls.mouseY = e.offsetY
		menuControls.selection = Math.floor(e.offsetY / canvas.height * 2)
	});
}

function initControls() {
	window.onkeydown = function(e) {
		if (e.code == "Space") player.action1Press();
		else if (e.code == "KeyM") {
			if (music[currentMusic].paused) music[currentMusic].play();
			else music[currentMusic].pause();
		}
		if (levelEditorEnabled) {
			if (e.code == "KeyT") {
				map.hexAtXY(player.mouseX, player.mouseY).toggleFrames();
			}
			else if (e.code == "KeyP") {
				player.x = player.mouseX;
				player.y = player.mouseY;
			}
		}
		keyboard[e.keyCode] = true;
	}
	
	window.onkeyup = function(e) {
		if (e.keyCode == 32) player.action1Release();
		keyboard[e.keyCode] = false;
	}
	
	canvasTop.addEventListener("mousedown", e => {
		if (!gameStarted) startGame();
		else {
			if (e.button == 0) {
				player.mousePressLeft();
			}
			else if (e.button == 2) {
				player.mousePressRight();
			}
		}
	});
	
	canvasTop.addEventListener("mousemove", e => {
		player.mouseX = e.offsetX + player.viewX0
		player.mouseY = e.offsetY + player.viewY0
	});
}

function playerMovement() {
	// Reset Movement //
	player.vx = 0;
	player.vy = 0;

	player.isWalking = false;
	
	// W //
	if(keyboard[87] || keyboard[38]) {
		player.vy = -Player.moveSpeed;
		player.isWalking = true;
		player.walkingDir = 1;
	}

	// S //
	if(keyboard[83] || keyboard[40]) {
		player.vy = Player.moveSpeed;
		player.isWalking = true;
		player.walkingDir = 0;
	}

	// A //
	if(keyboard[68] || keyboard[39]) {
		player.vx = Player.moveSpeed;
		player.isWalking = true;
		player.walkingDir = 3;
	}

	// D //
	if(keyboard[65] || keyboard[37]) {
		player.vx = -Player.moveSpeed;
		player.isWalking = true;
		player.walkingDir = 2;
	}

	if (player.dead) player.isWalking = false;

	if (player.isWalking && walkSound.paused) {
		walkSound.play();
	}
	else if (!player.isWalking && !walkSound.paused) {
		walkSound.pause();
		walkSound.currentTime = 0;
	}


	if (levelEditorEnabled) {
		if (keyboard[49]) map.hexAtXY(player.mouseX, player.mouseY).setType("pit")
		if (keyboard[50]) map.hexAtXY(player.mouseX, player.mouseY).setType("floor")
		if (keyboard[51]) map.hexAtXY(player.mouseX, player.mouseY).setType("wall")
		if (keyboard[52]) map.hexAtXY(player.mouseX, player.mouseY).setType("wallDestroyable")
	}

}