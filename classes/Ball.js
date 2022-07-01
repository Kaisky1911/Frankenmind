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
    ball = this;
  }
  static createFromDict(data) {
    let o = new Ball(data.x, data.y)
    o.loadData(data)
    return o
  }

  drawCalledByPlayer(dur) {
    drawSprite(Ball.spriteKey, this.x - Ball.size, this.y - Ball.size, 2 * Ball.size, 2 * Ball.size, 0, this.angle);
  }
  draw(dur) {
    if (ball.state != "attached") drawSprite(Ball.spriteKey, this.x - Ball.size, this.y - Ball.size, 2 * Ball.size, 2 * Ball.size, 0, this.angle);
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
      if (dx*dx + dy*dy > Ball.ropeLength*Ball.ropeLength) {
        let angle = Math.atan2(dy, dx);
        this.vx += 100 * Math.cos(angle);
        this.vy += 100 * Math.sin(angle);
      }
      else {
        this.state = "attached";
      }
      this.vx *= Math.exp(-4 * dur);
      this.vy *= Math.exp(-4 * dur);
    }
    else if (this.state == "free") {
      
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
      this.doBounceCollision();
    }
    this.updateHex();
  }

  
  doBounceCollision() {
    let hexs = map.getHexNeighboorHood(Map.toHexPosQ(this.x, this.y), Map.toHexPosR(this.x, this.y))
    for (let hex of hexs) {
        if (hex.solid) {
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
                    hex.gotHit(this.x, this.y, -dotProduct)
                }
            }
        }
    }
}

  detach() {
    this.state = "free";
    this.vx *= 1;
    this.vy *= 1;
    let vel = Math.sqrt(this.vx * this.vx + this.vy * this.vy)
    playSound("throw_brain", this.x, this.y, Math.min(1.0, vel / 3000));
  }

  returnToPlayer() {
    if (this.state == "free") this.state = "return";
  }

  static size = 20;
  static spriteKey = "ball";
  static ropeLength = 120;
}