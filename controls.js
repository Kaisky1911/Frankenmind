// < > |
function initControls() {
  window.onkeydown = function(e) {
    if (e.code == "Space") player.action1Press();
    else if (e.code == "KeyM") {
      if (music.paused) music.play();
      else music.pause();
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
  
  canvas.addEventListener("mousedown", e => {
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
  
  canvas.addEventListener("mousemove", e => {
    player.mouseX = e.offsetX + player.viewX0
    player.mouseY = e.offsetY + player.viewY0
  });
}

function playerMovement() {
  // Reset Movement //
  player.vx = 0;
  player.vy = 0;

  let isWalking = false;
  
  // W //
  if(keyboard[87] || keyboard[38]) {
    player.vy = -Player.moveSpeed;
    isWalking = true;
  }

  // S //
  if(keyboard[83] || keyboard[40]) {
    player.vy = Player.moveSpeed;
    isWalking = true;
  }

  // A //
  if(keyboard[68] || keyboard[39]) {
    player.vx = Player.moveSpeed;
    isWalking = true;
  }

  // D //
  if(keyboard[65] || keyboard[37]) {
    player.vx = -Player.moveSpeed;
    isWalking = true;
  }

  if (isWalking && walkSound.paused) {
    walkSound.play();
  }
  else if (!isWalking && !walkSound.paused) {
    walkSound.pause();
    walkSound.currentTime = 0;
  }
}