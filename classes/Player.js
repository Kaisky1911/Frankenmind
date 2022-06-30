// < > |

class Player extends GameObject {
  constructor(x, y) {
    super(x, y);
    this.vx = 0;
    this.vy = 0;
    this.ball = new Ball(this.x, this.y, this);
    this.camShakeIntensity = 0
    this.camShakeTime = 0
    this.updateViewPort();
    this.mouseX = 0;
    this.mouseY = 0;
    this.angle = 0;
    this.angleV = 0;
    this.handX = x + Player.handLength;
    this.handY = y;
    this.handVX = 0;
    this.handVY = 0;
    this.slowMowState = "none";
    this.slowMowTime = 0;
    this.action1pressed = false;
  }
  draw(dur) {
    
    if (this.slowMowState == "fadingin" || this.slowMowState == "slow") {
      this.drawPredictionLine();
    }

    drawSprite(Player.spriteKey, this.x - Player.size, this.y - Player.size, 2 * Player.size, 2 * Player.size); // size is in radius, so the sprite size is double (radius is easier for circular collision detection)
  }

  drawRope() {
    let dx = this.x - this.ball.x;
    let dy = this.y - this.ball.y;
    let angle = Math.atan2(dy, dx);
    let dis = Math.sqrt(dx*dx + dy*dy);
    let sprite = sprites["chain"];
    let renderSize = 10;
    let spriteCutOffWidth = Math.min(sprite.w, Math.round(dis * sprite.h / renderSize))

    ctx.save();
    ctx.translate(this.ball.x - this.viewX0, this.ball.y - this.viewY0);
    ctx.rotate(angle);
    ctx.drawImage(
      sprite.img,
      0, 0,
      spriteCutOffWidth, sprite.h,
      0, -0.5 * renderSize,
      dis, renderSize
    );
    ctx.restore();
  }

  drawPredictionLine() {
    ctx.lineWidth = Ball.size * 2;
    ctx.strokeStyle = "rgba(255, 0, 0, 0.1)"
    let angle = Math.atan2(this.ball.vy, this.ball.vx);
    ctx.beginPath();
    ctx.moveTo(this.ball.x  - this.viewX0, this.ball.y - this.viewY0);
    ctx.lineTo(this.ball.x  - this.viewX0 + 1000 * Math.cos(angle), this.ball.y - this.viewY0 + 1000 * Math.sin(angle));
    ctx.stroke();
  }

  updateAngle(dur) {
    /*
    let dx = this.mouseX - this.x;
    let dy = this.mouseY - this.y;
    let disSq = dx*dx + dy*dy;
    let cos = Math.cos(this.angle)
    let sin = Math.sin(this.angle)
    this.angleV += 50 * (cos * dy - sin * dx) / Math.sqrt(disSq);
    this.angleV *= 0.5;
    this.angle += this.angleV * dur;
    this.handX = this.x + Player.handLength * cos;
    this.handY = this.y + Player.handLength * sin;
    this.handVX = this.vx + Player.handLength * Math.cos(this.angleV);
    this.handVY = this.vy + Player.handLength * Math.sin(this.angleV);
    */
  }

  

  
  update(dur) {
    let realDur = dur / gameSpeed;
    if (this.slowMowState == "fadingin" || this.slowMowState == "slow") {
      this.slowMowTime += realDur;
    }
    if (this.slowMowState == "fadingin") {
      setGameSpeed(gameSpeed - (realDur / Player.slowMowFadeInTime) * (1.0 - Player.slowMowSpeed));
      if (gameSpeed <= Player.slowMowSpeed) {
        setGameSpeed(Player.slowMowSpeed);
        this.slowMowState = "slow";
      }
    }
    else if (this.slowMowState == "slow") {
      if (this.slowMowTime > Player.maxSlowMowTime) this.detachBall();
    }
    else if (this.slowMowState == "fadingout") {
      setGameSpeed(gameSpeed + (realDur / Player.slowMowFadeOutTime) * (1.0 - Player.slowMowSpeed));
      if (gameSpeed >= 1.0) {
        setGameSpeed(1.0);
        this.slowMowState = "none";
      }
    }
    
    this.x += this.vx * dur;
    this.y += this.vy * dur;
    map.doMoveCollision(this);
    this.updateHex()
    this.updateViewPort(dur);
    this.updateAngle(dur);
    this.ball.update(dur);
  }

  doCameraShake(intensity, dur) {
    this.camShakeIntensity = intensity
    this.camShakeTime = dur
    this.camShakeDur = dur
  }

  updateViewPort(dur) {
    let camShakeX = 0;
    let camShakeY = 0;
    if (this.camShakeTime > 0) {
      this.camShakeTime -= dur;
      camShakeX = (2 * Math.random() - 1) * this.camShakeTime / this.camShakeDur * this.camShakeIntensity;
      camShakeY = (2 * Math.random() - 1) * this.camShakeTime / this.camShakeDur * this.camShakeIntensity;
    }
    this.viewX0 = this.x - canvas.width / 2 + camShakeX;
    this.viewY0 = this.y - canvas.height / 2 + camShakeY;
    this.viewX1 = this.x + canvas.width / 2 + camShakeX;
    this.viewY1 = this.y + canvas.height / 2 + camShakeY;
  }

  detachBall() {
    this.ball.detach();
    if (this.slowMowState != "none") {
      this.slowMowState = "fadingout";
      //playSound("slowmow1", this.x, this.y, 1.0);
    }
  }
  
  action1Press() {
    if (this.action1pressed) return; // avoid multiple calls when holding the key
    this.action1pressed = true;
    if (this.ball.state == "attached") {
      this.slowMowTime = 0;
      this.slowMowState = "fadingin"; // fancy slowmow while holding mouse for better aiming (could use some bassy sound effects)
      //playSound("slowmow0", this.x, this.y, 1.0);
    }
    else if (this.ball.state == "free") this.ball.returnToPlayer();
  }
  action1Release() {
    this.action1pressed = false;
    if (this.ball.state == "attached") this.detachBall();
  }
  mousePressLeft() {
    if (levelEditorEnabled) {
      let q = Map.toHexPosQ(this.mouseX, this.mouseY)
      let r = Map.toHexPosR(this.mouseX, this.mouseY)
      let hex = map.get(q, r);
      if (hex.type == "wall") hex.setType("wallDestroyable");
      else if (hex.type == "wallDestroyable") hex.setType("pit");
      else hex.setType("wall");
    }
  }
  mousePressRight() {
    if (levelEditorEnabled) {
      let q = Map.toHexPosQ(this.mouseX, this.mouseY)
      let r = Map.toHexPosR(this.mouseX, this.mouseY)
      map.get(q, r).setType("floor");
    }
  }

  
  static size = 30; // size is in radius, so the sprite size is double (radius is easier for circular collision detection)
  static spriteKey = "player";
  static moveSpeed = 300.0;
  static maxSlowMowTime = 3.0;
  static slowMowFadeInTime = 0.4;
  static slowMowFadeOutTime = 0.2;
  static slowMowSpeed = 0.2;
  static handLength = 30;
}