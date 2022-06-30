// < > |


class Ball extends GameObject {
  constructor(x, y, player) {
    super(x, y);
    this.player = player;
    this.vx = 0;
    this.vy = 0;
    this.state = "attached";
    this.stretched = false;
  }

  draw(dur) {
    drawSprite(Ball.spriteKey, this.x - Ball.size, this.y - Ball.size, 2 * Ball.size, 2 * Ball.size);
  }

  update(dur) {
    // Ball Physics
    let dx = this.player.x - this.x;
    let dy = this.player.y - this.y;
    if ((this.state == "attached") && dx*dx + dy*dy > Ball.ropeLength*Ball.ropeLength) {
      this.stretched = true;
      let angle = Math.atan2(dy, dx);
      let dvx = this.vx - this.player.vx;
      let dvy = this.vy - this.player.vy;
      let ballAngle = Math.atan2(dvy, dvx);
      let cos = Math.cos(angle);
      let sin = Math.sin(angle);
      // dot product, if its small, ball velocity and player-ball relative position is about 90°, therefore rope is stretched and the ball should move on the circle without bouncing or stretching further
      if (Math.abs(cos * Math.cos(ballAngle) + sin * Math.sin(ballAngle)) < 0.3) {
        let vel = Math.sqrt(dvx*dvx + dvy*dvy)
        let clockwise = cos * Math.sin(ballAngle) - sin * Math.cos(ballAngle) > 0 // cross product to get orientation
        if (clockwise) {
          this.vx = -vel * sin + player.vx; // 90° rotated, hence the sin in x and -cos in y
          this.vy = vel * cos + player.vy;
        }
        else {
          this.vx = vel * sin + player.vx;
          this.vy = -vel * cos + player.vy;
        }
        this.x = this.player.x - Ball.ropeLength * cos;
        this.y = this.player.y - Ball.ropeLength * sin;
      }
      else {
        let dotProduct = cos * (this.vx - this.player.vx) + sin * (this.vy - this.player.vy)
        this.vx -= cos * dotProduct;
        this.vy -= sin * dotProduct;
      }
    }
    else if (this.state == "return") {
      let dx = this.player.x - this.x;
      let dy = this.player.y - this.y;
      if (dx*dx + dy*dy > Ball.ropeLength*Ball.ropeLength) {
        let angle = Math.atan2(dy, dx);
        this.vx += 100 * Math.cos(angle);
        this.vy += 100 * Math.sin(angle);
      }
      else {
        this.state = "attached";
      }
      this.vx *= Math.exp(-2 * dur);
      this.vy *= Math.exp(-2 * dur);
    }
    else if (this.state == "free") {
      
    }
    else {
      this.stretched = false;
    }
    this.x += this.vx * dur;
    this.y += this.vy * dur;
    this.vx *= Math.exp(-dur/2);
    this.vy *= Math.exp(-dur/2);
    if (this.state != "return") {
      map.doBounceCollision(this);
    }
    this.updateHex();
  }

  detach() {
    this.state = "free";
    this.vx *= 2;
    this.vy *= 2;
    // playSound("ballShoot", this.x, this.y, 1.0);
  }

  returnToPlayer() {
    if (this.state == "free") this.state = "return";
  }

  static size = 10;
  static spriteKey = "ball";
  static ropeLength = 100;
}