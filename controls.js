// < > |
function initControls() {
  window.onkeydown = function(e) {
    if (e.keyCode == 32) player.action1Press();
    keyboard[e.keyCode] = true;
  }
  
  window.onkeyup = function(e) {
    if (e.keyCode == 32) player.action1Release();
    keyboard[e.keyCode] = false;
  }
  
  canvas.addEventListener("mousedown", e => {
    if (!gameStarted) startGame();
    else {
      if (e.button == 2) {
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
  
  // W //
  if(keyboard[87] || keyboard[38]) {
    player.vy = -Player.moveSpeed;
  }

  // S //
  if(keyboard[83] || keyboard[40]) {
    player.vy = Player.moveSpeed;
  }

  // A //
  if(keyboard[68] || keyboard[39]) {
    player.vx = Player.moveSpeed;
  }

  // D //
  if(keyboard[65] || keyboard[37]) {
    player.vx = -Player.moveSpeed;
  }
}