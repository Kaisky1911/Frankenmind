// < > |


class Projectile extends GameObject {
    constructor(x, y, w, h, sprite, angle, dmg, speed, size, duration) {
        super(x, y);
        this.w = w;
        this.h = h;
        this.sprite = sprite;
        this.angle = angle;
        this.dmg = dmg;
        this.speed = speed;
        this.size = size;
        this.vx = speed * Math.cos(angle);
        this.vy = speed * Math.sin(angle);
        this.duration = duration
        this.time = duration
    }


    update(dur) {
        this.time -= dur;
        if (this.time <= 0) {
            this.delete();
            return;
        }
        this.x += this.vx * dur;
        this.y += this.vy * dur;
        this.updateHex();
        if (this.hex.solid) {
            this.onWallHit();
            this.delete();
        }

        
        if (this.checkSingleObjectCollision(ball)) {
            this.onHit();
            return;
        }
        if (this.checkSingleObjectCollision(player)) {
            player.damage(this.dmg)
            this.onHit();
            return;
        }
    }
    
    onHit() {}
    onWallHit() {}
}

class Fireball extends Projectile {
    constructor(x, y, angle) {
        super(x, y, 36, 54, "fireball", angle, 2, 500, 20, 10.0);
        this.frameTimer = 0;
        this.timePerFrame = 0.1;
    }

    onHit() {
        this.delete();
    }
    draw(dur) {
        let frameCount = sprites[this.sprite].frames
        this.frameTimer += dur;
        if (this.frameTimer > this.timePerFrame * frameCount) {
            this.frameTimer -= this.timePerFrame * frameCount;
        }
        let frame = Math.floor(this.frameTimer / this.timePerFrame) % frameCount;
        drawSprite("fireball", this.x - this.w/2, this.y - this.h/2, this.w, this.h, frame, this.angle - Math.PI / 2, ctx);
    }
}

class Boulder extends Projectile {
    constructor(x, y, angle) {
        super(x, y, 100, 100, "boulder", angle, 999, 400, 50, 10.0);
    }

    onWallHit() {
        playSound("boulder", this.x, this.y, 0.5)
    }

    draw(dur) {
        drawSprite("boulder", this.x - this.w/2, this.y - this.h/2, this.w, this.h, 0, this.angle, ctx);
    }
}