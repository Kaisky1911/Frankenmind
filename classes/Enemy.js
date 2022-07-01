// < > |

class Enemy extends GameObject {
  constructor(x, y, sprite, size, aggroRange, speed, postAttackKnockBackSpeed, mass, hp, ballVelPerDamage, timePerFrame, context, permaAggro) {
    super(x, y);
    this.sprite = sprite;
    this.size = size;
    this.aggroRangeSq = aggroRange*aggroRange;
    this.speed = speed;
    this.postAttackKnockBackSpeed = postAttackKnockBackSpeed;
    this.mass = mass;
    this.hp = hp;
    this.ballVelPerDamage = ballVelPerDamage;
    this.timePerFrame = timePerFrame;
    this.context = context;
    this.permaAggro = permaAggro;
    this.vx = 0;
    this.vy = 0;
    this.frameTimer = 0;
    this.startX = x;
    this.startY = y;
    this.stunTimer = 0;
    this.tookDamageTimer = 0;
    this.dead = false;
    this.deadTimer = 0;
  }
  stringify() {
    let c = this.context;
    delete this.context;
    let str = super.stringify();
    this.context = c;
    return str;
  }

  draw(dur) {
    let frameCount = sprites[this.sprite].frames
    if (this.stunTimer <= 0 && !this.dead) {
      this.frameTimer += dur;
      if (this.frameTimer > this.timePerFrame * frameCount) {
        this.frameTimer -= this.timePerFrame * frameCount;
        this.onAnimationLoopReset()
      }
    }

    let frame = Math.floor(this.frameTimer / this.timePerFrame) % frameCount;
    drawSprite(this.sprite, this.x - this.size, this.y - this.size, 2 * this.size, 2 * this.size, frame, 0, this.context);
  }

  applyStun(dur) {
    if (dur > this.stunTimer) this.stunTimer = dur;
  }

  damage(dmg) {
    if (dmg > 0) {
      this.hp -= dmg;
      this.tookDamageTimer = 0.5;
    }
    if (this.hp <= 0) {
      this.dead = true;
      this.onDeath();
      return;
    }
  }

  update(dur) {
    if (this.dead) {
      this.vx *= Math.exp(-16 * dur);
      this.vy *= Math.exp(-16 * dur);
      this.deadTimer += dur;
      if (this.deadTimer > 1.0) {
        this.delete();
        return;
      }
    }
    else {
      let dx
      let dy
      let disSq
      let minDis
      let angle
      if (this.tookDamageTimer > 0) {
        this.tookDamageTimer -= dur;
      }
      else {
        dx = ball.x - this.x;
        dy = ball.y - this.y;
        disSq = dx*dx + dy*dy
        minDis = this.size + Ball.size
        angle;
        if (disSq < minDis*minDis) {
          let vel = Math.sqrt(ball.vx*ball.vx + ball.vy*ball.vy)
          if (vel > this.ballVelPerDamage) {
            angle = Math.atan2(dy, dx);
            this.applyStun(vel / 2000);
            this.vx = ball.vx / this.mass;
            this.vy = ball.vy / this.mass;
            this.damage(Math.floor(vel / this.ballVelPerDamage));
          }
        }
      }


      if (this.stunTimer > 0) {
        isInCombat = true;
        this.stunTimer -= dur;
        this.vx *= Math.exp(-16 * dur);
        this.vy *= Math.exp(-16 * dur);
      }
      else {
        dx = player.x - this.x;
        dy = player.y - this.y;
        disSq = dx*dx + dy*dy
        if (this.permaAggro || disSq < this.aggroRangeSq) {
          isInCombat = true;
          angle = Math.atan2(dy, dx);
          minDis = this.size + Player.size
          if (disSq < minDis*minDis) {
            this.applyStun(0.5);
            this.vx = -this.postAttackKnockBackSpeed * Math.cos(angle);
            this.vy = -this.postAttackKnockBackSpeed * Math.sin(angle);
            player.damage(1);
            this.onAttack();
          }
          else {
            this.vx = this.speed * Math.cos(angle);
            this.vy = this.speed * Math.sin(angle);
          }
        }
        else {
          dx = this.startX - this.x;
          dy = this.startY - this.y;
          if (dx*dx + dy*dy > 100) {
            angle = Math.atan2(this.startY - this.y, this.startX - this.x);
            this.vx = this.speed * Math.cos(angle);
            this.vy = this.speed * Math.sin(angle);
          }
          else {
            this.vx = 0;
            this.vy = 0;
          }
        }
      }
    }

    this.x += this.vx * dur;
    this.y += this.vy * dur;
    this.updateHex();
  }

  onAnimationLoopReset() {}
  onAttack() {}
  onDeath() {}
}

class Bat extends Enemy {
  constructor(x, y, permaAggro = false) {
    super(x, y, "bat", 30, 1000, 100, 500, 0.5, 1, 500, 0.1, ctxTop, permaAggro);
  }
  static createFromDict(data) {
    let o = new Bat(data.x, data.y, data.permaAggro)
    o.loadData(data)
    return o
  }
  onAttack() {
    playSound("bat_attack", this.x, this.y, 0.5)
  }
  onDeath() {
    playSound("bat_death", this.x, this.y, 0.5)
  }
  onAnimationLoopReset() {
    playSound("bat_flap_2", this.x, this.y, 0.2)
  }
}