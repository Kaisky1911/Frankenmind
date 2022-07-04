// < > |


class Ball extends GameObject {
  constructor(x, y) {
    super(x, y);
    this.vx = 0;
    this.vy = 0;
    this.angle = 0;
    this.vAngle = 0;
    this.state = "attached";
    this.stretched = false;
    this.fallingDownDis = 1;
    this.playerDisAtPullBackTime = null;
    this.fallingDownDisAtPullBackTime = null;
    this.size = Ball.size
    this.underEarth = false;
    ball = this;
  }
  static createFromDict(data) {
    let o = new Ball(data.x, data.y)
    o.loadData(data)
    return o
  }

  drawCalledByPlayer(dur) {
    let size = Ball.size / this.fallingDownDis
    let context = ctx;
    if (this.fallingDownDis > 1.5) context = ctxBack;
    drawSprite(Ball.spriteKey, this.x - size, this.y - size + 100 * (this.fallingDownDis - 1.0), 2 * size, 2 * size, 0, this.angle, context);
    drawShadow(this.x, this.y + size, size, ctxShadow);
  }
  draw(dur) {
    let size = Ball.size / this.fallingDownDis
    if (ball.state != "attached") {
      let context = ctx;
      if (this.fallingDownDis > 1.5) context = ctxBack;
      drawSprite(Ball.spriteKey, this.x - size, this.y - size + 100 * (this.fallingDownDis - 1.0), 2 * size, 2 * size, 0, this.angle, context);
    } 
    drawShadow(this.x, this.y + 1.2 * size, 0.8 * size, ctxShadow);
  }

  update(dur) {} // ignore

  updateCalledByPlayer(dur) {
    // Ball Physics
    let dx = player.x - this.x;
    let dy = player.y - this.y;
    if ((this.state == "attached") && dx*dx + dy*dy > Ball.ropeLength*Ball.ropeLength) {
      this.stretched = true;
      let angle = Math.atan2(dy, dx);
      let dvx = this.vx - player.vx;
      let dvy = this.vy - player.vy;
      let ballAngle = Math.atan2(dvy, dvx);
      let cos = Math.cos(angle);
      let sin = Math.sin(angle);
      // dot product, if its small, ball velocity and player-ball relative position is about 90°, therefore rope is stretched and the ball should move on the circle without bouncing or stretching further
      if (Math.abs(cos * Math.cos(ballAngle) + sin * Math.sin(ballAngle)) < 0.3) {
        let vel = Math.sqrt(dvx*dvx + dvy*dvy)
        this.angle = angle - Math.PI / 2;
        let clockwise = cos * Math.sin(ballAngle) - sin * Math.cos(ballAngle) > 0 // cross product to get orientation
        if (clockwise) {
          this.vAngle = -vel / Ball.ropeLength;
          this.vx = -vel * sin + player.vx; // 90° rotated, hence the sin in x and -cos in y
          this.vy = vel * cos + player.vy;
        }
        else {
          this.vAngle = vel / Ball.ropeLength;
          this.vx = vel * sin + player.vx;
          this.vy = -vel * cos + player.vy;
        }
        this.x = player.x - Ball.ropeLength * cos;
        this.y = player.y - Ball.ropeLength * sin;
      }
      else {
        let dotProduct = cos * (this.vx - player.vx) + sin * (this.vy - player.vy)
        if (dotProduct < 0) {
          this.vx -= 1.5 * cos * dotProduct;
          this.vy -= 1.5 * sin * dotProduct;
        }
      }
    }
    else if (this.state == "return") {
      let dx = player.x - this.x;
      let dy = player.y - this.y;
      let dis = Math.sqrt(dx*dx + dy*dy) - Ball.ropeLength
      if (this.playerDisAtPullBackTime == null) {
        this.playerDisAtPullBackTime = dis;
        this.fallingDownDisAtPullBackTime = this.fallingDownDis - 1.0;
      }
      this.fallingDownDis = 1.0 + this.fallingDownDisAtPullBackTime * dis / this.playerDisAtPullBackTime;
      if (this.fallingDownDis < 1.5) {
        this.underEarth = false
      }
      if (dis > 0) {
        let angle = Math.atan2(dy, dx);
        this.vx += 10000 * Math.cos(angle) * dur;
        this.vy += 10000 * Math.sin(angle) * dur;
      }
      else {
        this.attach();
      }
      this.vx *= Math.exp(-4 * dur);
      this.vy *= Math.exp(-4 * dur);
    }
    else if (this.state == "free") {
      if (this.hex.isPit) {
        this.fallingDownDis += dur;
        if (this.fallingDownDis > 1.5) {
          if (!this.underEarth) {
            playSound("brain_fall", this.x, this.y, 0.4);
            player.doSpeech("lostbrain")
            this.underEarth = true;
          }
        }
      }
      else if(this.fallingDownDis <= 1.5) {
        this.fallingDownDis = 1;
      }
    }
    else {
      this.stretched = false;
    }
    this.x += this.vx * dur;
    this.y += this.vy * dur;
    this.angle += this.vAngle * dur;
    this.vx *= Math.exp(-dur/4);
    this.vy *= Math.exp(-dur/4);
    this.vAngle *= Math.exp(-dur/4);
    if (this.state != "return") {
      this.doBounceCollision(this.fallingDownDis > 1.5);
    }
    this.updateHex();
  }

  
  doBounceCollision(inPit = false) {
    let hexs = map.getHexNeighboorHood(Map.toHexPosQ(this.x, this.y), Map.toHexPosR(this.x, this.y))
    for (let hex of hexs) {
        if ((!inPit && hex.solid) || (inPit && !hex.isPit)) {
            let dx = this.x - hex.x;
            let dy = this.y - hex.y;
            let disSq = dx*dx + dy*dy;
            let minDis = this.constructor.size + Hex.size;
            if (disSq < minDis*minDis) { // overlap
                let angle = Math.atan2(dy, dx);
                let cos = Math.cos(angle)
                let sin = Math.sin(angle)
                let dotProduct = cos*this.vx + sin*this.vy
                if (dotProduct < 0) { // checks if the obj is actually moving towards the hex (dot product)
                    this.vx -= 1.5 * dotProduct * cos;
                    this.vy -= 1.5 * dotProduct * sin;
                    player.doCameraShake(Math.min(-dotProduct / 100, 10), 0.5);
                    hex.gotHit(this.x, this.y, -dotProduct, angle + Math.PI)
                }
            }
        }
    }
}

  attach() {
    this.state = "attached";
    this.fallingDownDis = 1.0;
    this.playerDisAtPullBackTime = null;
  }

  detach() {
    this.state = "free";
    this.vx *= 1;
    this.vy *= 1;
    let vel = Math.sqrt(this.vx * this.vx + this.vy * this.vy)
    playSound("throw_brain", this.x, this.y, Math.min(1.0, vel / 3000));
    player.doSpeech("throwbrain")
  }

  returnToPlayer() {
    if (this.state == "free") {
      let dx = player.x - this.x;
      let dy = player.y - this.y;
      let dis = Math.sqrt(dx*dx + dy*dy) - Ball.ropeLength
      if (dis < 0) {
        this.attach();
        player.disableNextAction1PressRelease = true;
      }
      else {
        this.state = "return";
      }
    }
  }

  static size = 20;
  static spriteKey = "ball";
  static ropeLength = 100;
}