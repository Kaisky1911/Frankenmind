// < > |

class Player extends GameObject {
  constructor(x, y) {
    super(x, y);
    this.vx = 0;
    this.vy = 0;
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
    this.maxHp = 6;
    this.hp = this.maxHp;
    this.frameTimer = 0;
    this.timePerFrame = 0.1;
    this.isWalking = false;
    this.tookDamageTimer = 0;
    this.dead = false;
    this.deadTimer = 0;
    this.walkingDir = 0;
    player = this;
  }
  static createFromDict(data) {
    let o = new Player(data.x, data.y)
    o.loadData(data)
    return o
  }
  draw(dur) {
    if (ball.state == "attached") ball.drawCalledByPlayer(dur);
    this.drawRope();
    if (this.slowMowState == "fadingin" || this.slowMowState == "slow") {
      this.drawPredictionLine();
    }
    if (this.isWalking && !this.dead) this.frameTimer += dur;
    else this.frameTimer = 0;
    let frame = Math.floor(this.frameTimer / this.timePerFrame) % sprites[Player.spriteKey].frames;
    let angle = 0;
    if (this.dead) {
      angle = Math.min(this.deadTimer, 0.5) * Math.PI
    }
    drawSprite(Player.spriteKey, this.x - Player.size, this.y - Player.size, 2 * Player.size, 2 * Player.size, frame, angle, ctx, this.walkingDir);
  }

  drawRope() {
    if (ball.state != "attached") {
      return;
    }
    let dx = this.x - ball.x;
    let dy = this.y - ball.y;
    let angle = Math.atan2(dy, dx);
    let dis = Math.sqrt(dx*dx + dy*dy);
    let sprite = sprites["chain"];
    let renderSize = 10;
    let spriteCutOffWidth = Math.min(sprite.w, Math.round(dis * sprite.h / renderSize))

    ctx.save();
    ctx.translate(ball.x - this.viewX0, ball.y - this.viewY0);
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
    let angle = Math.atan2(ball.vy, ball.vx);
    ctx.beginPath();
    ctx.moveTo(ball.x  - this.viewX0, ball.y - this.viewY0);
    ctx.lineTo(ball.x  - this.viewX0 + 1000 * Math.cos(angle), ball.y - this.viewY0 + 1000 * Math.sin(angle));
    ctx.stroke();
  }

  damage(dmg) {
    if (dmg > 0) {
      this.hp -= dmg;
      this.tookDamageTimer = 0.5;
    }
    if (this.hp <= 0) {
      this.dead = true;
      return;
    }
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

  canBeAttacked() {
    return this.tookDamageTimer <= 0;
  }
  

  
  update(dur) {
    if (this.dead) {
      this.deadTimer += dur;
      if (this.deadTimer > 2) {
        loadGame();
      }
      return;
    }
    if (this.tookDamageTimer > 0) {
      this.tookDamageTimer -= dur;
    }
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
    ball.updateCalledByPlayer(dur);
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
    ball.detach();
    if (this.slowMowState != "none") {
      this.slowMowState = "fadingout";
      //playSound("slowmow1", this.x, this.y, 1.0);
    }
  }
  
  action1Press() {
    if (this.action1pressed) return; // avoid multiple calls when holding the key
    this.action1pressed = true;
    if (ball.state == "attached") {
      this.slowMowTime = 0;
      this.slowMowState = "fadingin"; // fancy slowmow while holding mouse for better aiming (could use some bassy sound effects)
      //playSound("slowmow0", this.x, this.y, 1.0);
    }
    else if (ball.state == "free") ball.returnToPlayer();
  }
  action1Release() {
    this.action1pressed = false;
    if (ball.state == "attached") this.detachBall();
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