// < > |

var gamepad = null;

var menuControls = {
	"mouseX": 0,
	"mouseY": 0,
	"selection": null
}

function buttonPressed(b) {
	console.log(b)
	if (typeof(b) == "object") {
		return b.pressed;
	}
	return b == 1.0;
}


function initMainMenuControls() {
	canvas.addEventListener("mousedown", e => {
		if (e.button == 0) {
			if (clickToFocus) {
				clickToFocus = false;
				initAudio();
			}
			else {
				if (menuControls.selection == 0) {
					startGame();
					map.data = Map.createMapDataFromDict(mapData, false)
					new Player(200, 200);
					new Ball(200, 200 + Ball.ropeLength);
					initGameEvents();
				}
				if (menuControls.selection == 1) {
					startGame();
					map.data = Map.createMapDataFromDict(mapData, false)
					new Player(200, 200);
					new Ball(200, 200 + Ball.ropeLength);
					initGameEvents();
					loadGame();
					actuallyLoadGame();
				}
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
		if (e.code == "KeyZ" && keyboard[66] && keyboard[78]) {
			levelEditorEnabled = !levelEditorEnabled;
			if (!levelEditorEnabled) saveGame("leveleditor");
			else loadGame("leveleditor");
		}
		if (levelEditorEnabled) {
			if (e.code == "KeyT") {
				map.hexAtXY(player.mouseX, player.mouseY).toggleFrames();
			}
			else if (e.code == "KeyE") {
				let hex = map.hexAtXY(player.mouseX, player.mouseY)
				if (hex.objects.size == 0) {
					new Bat(hex.x, hex.y)
				}
				else {
					let o = hex.objects.values().next().value;
					if (o.constructor.name == "Bat") {
						o.delete();
						new Snake(hex.x, hex.y)
					}
					else if (o.constructor.name == "Snake") {
						o.delete();
						new Rat(hex.x, hex.y)
					}
					else if (o.constructor.name == "Rat") {
						o.delete();
					}
				}
			}
			else if (e.code == "KeyC") {
				let hex = map.hexAtXY(player.mouseX, player.mouseY)
				if (hex.objects.size == 0) {
					new Heart(hex.x, hex.y)
				}
				else {
					let o = hex.objects.values().next().value;
					if (o.constructor.name == "Heart") {
						o.delete();
						new Lever(hex.q, hex.r)
					}
					else if (o.constructor.name == "Lever") {
						o.delete();
					}
				}
			}
			else if (e.code == "KeyL") {
				let hex = map.hexAtXY(player.mouseX, player.mouseY)
				let lco = null;
				for (let o of hex.objects) if (o.constructor.name == "LavaController") {
					lco = o;
				}
				if (lco == null) {
					new LavaController(hex.x, hex.y)
				}
				else {
					lco.toggleSetting()
				}
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
				//player.mousePressLeft();
			}
			else if (e.button == 2) {
				//player.mousePressRight();
			}
		}
	});
	
	canvasTop.addEventListener("mousemove", e => {
		player.mouseX = e.offsetX + player.viewX0
		player.mouseY = e.offsetY + player.viewY0
	});

	window.addEventListener("gamepadconnected", function(e) {
		gamepad = navigator.getGamepads()[e.gamepad.index];
		console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
			e.gamepad.index, e.gamepad.id,
			e.gamepad.buttons.length, e.gamepad.axes.length);
	  });
}


var button0lastState = false;

function playerMovement() {
	// Reset Movement //
	player.vx = 0;
	player.vy = 0;

	player.isWalking = false;
	

	if (gamepad != null) {
		if (buttonPressed(gamepad.buttons[0]) && !button0lastState) {
			player.action1Press();
			button0lastState = true;
		}
		else if (!buttonPressed(gamepad.buttons[0]) && button0lastState) {
			player.action1Release();
			button0lastState = false;
		}
	}


	// W //
	if(keyboard[87] || keyboard[38] || (gamepad != null && buttonPressed(gamepad.buttons[12]))) {
		player.vy = -Player.moveSpeed;
		player.isWalking = true;
		player.walkingDir = 1;
	}

	// S //
	if(keyboard[83] || keyboard[40] || (gamepad != null && buttonPressed(gamepad.buttons[13]))) {
		player.vy = Player.moveSpeed;
		player.isWalking = true;
		player.walkingDir = 0;
	}

	// A //
	if(keyboard[68] || keyboard[39] || (gamepad != null && buttonPressed(gamepad.buttons[14]))) {
		player.vx = Player.moveSpeed;
		player.isWalking = true;
		player.walkingDir = 3;
	}

	// D //
	if(keyboard[65] || keyboard[37] || (gamepad != null && buttonPressed(gamepad.buttons[15]))) {
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
		if (keyboard[53]) map.hexAtXY(player.mouseX, player.mouseY).setType("wallMovable")
		if (keyboard[54]) map.hexAtXY(player.mouseX, player.mouseY).setType("lava")
		if (keyboard[55]) map.hexAtXY(player.mouseX, player.mouseY).setType("door")
	}

}