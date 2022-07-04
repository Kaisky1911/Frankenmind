// < > |

class Enemy extends GameObject {
    constructor(x, y, sprite, w, h, size, speed, postAttackKnockBackSpeed, mass, hp, timePerFrame, context, eventSpawned, actionCount) {
        super(x, y);
        this.sprite = sprite;
        this.w = w;
        this.h = h;
        this.size = size;
        this.speed = speed;
        this.postAttackKnockBackSpeed = postAttackKnockBackSpeed;
        this.mass = mass;
        this.hp = hp;
        this.timePerFrame = timePerFrame;
        this.context = context;
        this.eventSpawned = eventSpawned;
        this.actionCount = actionCount;
        this.action = 0;
        this.vx = 0;
        this.vy = 0;
        this.frameTimer = 0;
        this.startX = x;
        this.startY = y;
        this.stunTimer = 0;
        this.tookDamageTimer = 0;
        this.dead = false;
        this.deadTimer = 0;
        this.angle = 0;
        this.drawAngle = 0;
        this.pathHexList = null;
        this.redoPathfindingTimer = 0;
        this.attackTimer = 0;
        this.ballVelPerDamage = 500;
        this.aggroCheckTimer = 0;
        this.onAggro = false;
    }
    stringify() {
        let c = this.context;
        let phl = this.pathHexList
        delete this.context;
        delete this.pathHexList;
        let str = super.stringify();
        this.context = c;
        this.pathHexList = phl;
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
        let redBlink = 0;
        if (Math.floor(this.tookDamageTimer / 0.1) % 2 == 1) redBlink = 1;
        drawSprite(this.sprite, this.x - this.w/2, this.y - this.h/2, this.w, this.h, frame, this.drawAngle, this.context, this.action + redBlink * this.actionCount);
        this.onDraw();
    }

    applyStun(dur) {
        if (dur > this.stunTimer) this.stunTimer = dur;
    }

    damage(dmg) {
        if (dmg > 0) {
            this.onDamage();
            this.attackTimer = 0;
            this.hp -= dmg;
            this.tookDamageTimer = 0.5;
            let size = 20 * Math.sqrt(dmg)
            let color = Math.min(1.0, 0.1 * dmg)
            doVisualEffect(new EffectNumberPop(this.x, this.y - this.size, dmg, [1.0, 1.0-color, 1.0-color], size))
        }
        if (this.hp <= 0) {
            if (Math.random() < 0.3 && !this.dead) new Heart(this.x, this.y)
            this.dead = true;
            this.onDeath();
            return;
        } else {
            playSound("enemy_death", this.x, this.y, 0.2)
        }
    }

    update(dur) {
        if (levelEditorEnabled) return;
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
            if (this.redoPathfindingTimer > 0) {
                this.redoPathfindingTimer -= dur;
            }
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
                if (disSq < minDis*minDis) {
                    let vel = Math.sqrt(ball.vx*ball.vx + ball.vy*ball.vy)
                    if (ball.state != "attached") vel *= 2;
                    if (vel > this.ballVelPerDamage) {
                        let dmg = Math.floor(vel / this.ballVelPerDamage)
                        if (this.constructorName == "Lizard" && dmg < 5) {
                            doVisualEffect(new EffectNumberPop(this.x, this.y - this.h / 2, "too weak!", [0.5, 1.0, 0.5], 20, 1))
                            this.tookDamageTimer = 0.5;
                        }
                        else {
                            angle = Math.atan2(dy, dx);
                            this.applyStun(vel / 2000);
                            this.vx = ball.vx / this.mass;
                            this.vy = ball.vy / this.mass;
                            this.damage(dmg);
                            player.doSpeech("hitenemy");
                        }
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
                this.updatePlayerAggro(disSq, dur);
                if (this.onAggro) {
                    isInCombat = true;
                    angle = Math.atan2(dy, dx);
                    minDis = this.size + Player.size
                    if (disSq < minDis*minDis) {
                        this.attackTimer = 0;
                        this.onMeleeAttack(angle);
                    }
                    else {
                        if (disSq < this.getAttackRangeSq()) {
                            this.doAttack(angle, dur);
                        }
                        else if (this.constructor.name == "Bat") this.flyTo(player.x, player.y)
                        else this.walkTo(player.hex);
                    }
                }
                else {
                    this.attackTimer = 0;
                    dx = this.startX - this.x;
                    dy = this.startY - this.y;
                    if (dx*dx + dy*dy > 100) {
                        if (this.constructor.name == "Bat") this.flyTo(this.startX, this.startY)
                        else this.walkTo(map.hexAtXY(this.startX, this.startY));
                    }
                    else {
                        this.vx = 0;
                        this.vy = 0;
                    }
                }
            }
        }
        if (this.vx != 0 || this.vy != 0) this.angle = Math.atan2(this.vy, this.vx);
        this.x += this.vx * dur;
        this.y += this.vy * dur;
        if (this.constructor.name != "Bat") {
            map.doMoveCollision(this);
        }
        this.updateHex();
    }

    flyTo(x, y) {
        this.attackTimer = 0;
        let angle = Math.atan2(y - this.y, x - this.x);
        this.vx = this.speed * Math.cos(angle);
        this.vy = this.speed * Math.sin(angle);
    }
    
    walkTo(targetHex) {
        if (this.pathHexList == null && this.redoPathfindingTimer <= 0) {
            this.redoPathfindingTimer = Math.random() * 2;
            this.pathHexList = map.findPathFromTo(this.hex, targetHex)
        }
        if (this.pathHexList != null) {
            let hex = this.pathHexList[this.pathHexList.length - 1]
            if (this.hex == hex && this.pathHexList.length > 0) {
                if (this.pathHexList.length > 1) {
                    hex = this.pathHexList[this.pathHexList.length - 2]
                    this.pathHexList.pop()
                }
                this.pathHexList = null;
            }
            this.flyTo(hex.x, hex.y)
        }
        else {
            this.flyTo(targetHex.x, targetHex.y)
        }
    }

    onMeleeAttack(angle) {
        this.applyStun(0.5);
        this.vx = -this.postAttackKnockBackSpeed * Math.cos(angle);
        this.vy = -this.postAttackKnockBackSpeed * Math.sin(angle);
        player.damage(1);
    }

    onAnimationLoopReset() {}
    doAttack() {}
    onDeath() {}
    onDraw() {}
    onDamage() {}
    getAttackRangeSq() {
        return 0;
    }
    updatePlayerAggro(disSq, dur) {
        this.aggroCheckTimer += dur;
        if (this.aggroCheckTimer > 2) {
            this.aggroCheckTimer -= 2*Math.random();
            let tileRange = 5;
            if (wasInCombat) tileRange *= 2;
            let path = map.findPathFromTo(this.hex, player.hex, tileRange, this.getAttackRangeSq() != 0)
            this.onAggro = path != null;
        }
    }
}

class Bat extends Enemy {
    constructor(x, y, eventSpawned = false) {
        super(x, y, "bat", 76, 52, 30, 100, 500, 0.5, 5, 0.1, ctxTop, eventSpawned, 1);
    }
    static createFromDict(data) {
        let o = new Bat(data.x, data.y, data.eventSpawned)
        o.loadData(data)
        return o
    }
    onDraw() {
        drawShadow(this.x, this.y + 2 * this.size, 0.5 * this.size, ctxTopShadow);
    }
    onMeleeAttack(angle) {
        super.onMeleeAttack(angle);
        playSound("bat_attack", this.x, this.y, 0.5)
    }
    onDeath() {
        playSound("enemy_death", this.x, this.y, 0.5)
    }
    onAnimationLoopReset() {
        playSound("bat_flap_2", this.x, this.y, 0.2)
    }
    updatePlayerAggro(disSq, dur) {
        let aggroRange = 500 * 500
        if (wasInCombat) aggroRange = 2 * aggroRange;
        else {
            if (this.constructorName == "Snake") player.doSpeech("snakes")
        }
        this.onAggro = aggroRange > disSq
    }
}

class Snake extends Enemy {
    constructor(x, y, eventSpawned = false) {
        super(x, y, "snake", 96, 60, 30, 100, 1000, 0.5, 5, 0.1, ctx, eventSpawned, 4);
    }
    static createFromDict(data) {
        let o = new Snake(data.x, data.y, data.eventSpawned)
        o.loadData(data)
        return o
    }
    onDraw() {
        this.action = Math.floor(2 * this.angle / Math.PI + 4.5) % 4
        drawShadow(this.x, this.y + 0.8 * this.size, 0.5 * this.size, ctxShadow);
    }
    onMeleeAttack(angle) {
        this.applyStun(1.0);
        player.damage(1);
    }
    doAttack(angle, dur) {
        this.vx = 0;
        this.vy = 0;
        this.angle = angle
        this.attackTimer += dur;
        if (this.attackTimer > 2.0) {
            this.attackTimer = 0;
            playSound("snake_attack", this.x, this.y, 0.8)
            new Fireball(this.x + this.size * Math.cos(angle), this.y + this.size * Math.sin(angle), angle)
        }
    }
    onMeleeAttack(angle) {
        super.onMeleeAttack(angle);
        playSound("bat_attack", this.x, this.y, 0.5)
    }
    onDeath() {
        playSound("enemy_death", this.x, this.y, 0.5)
    }
    onAnimationLoopReset() {
        playSound("bat_flap_2", this.x, this.y, 0.2)
    }
    getAggroRangeSq() {
        return 600*600;
    }
    getAttackRangeSq() {
        return 700*700;
    }
}

class Rat extends Enemy {
    constructor(x, y, eventSpawned = false) {
        super(x, y, "rat", 51, 87, 30, 200, 500, 0.5, 5, 0.2, ctx, eventSpawned, 1);
    }
    static createFromDict(data) {
        let o = new Rat(data.x, data.y, data.eventSpawned)
        o.loadData(data)
        return o
    }
    onDraw() {
        if (this.stunTimer <= 0) this.drawAngle = this.angle - Math.PI / 2;
        drawShadow(this.x, this.y + 0.1 * this.size, 0.9 * this.size, ctxShadow);
    }
    onMeleeAttack(angle) {
        super.onMeleeAttack(angle);
        playSound("rat_attack", this.x, this.y, 0.5)
    }
    onDeath() {
        playSound("enemy_death", this.x, this.y, 0.5)
    }
    onAnimationLoopReset() {
        playSound("rat_move", this.x, this.y, 0.2)
    }
}

class Lizard extends Enemy {
    constructor(x, y, eventSpawned = false) {
        super(x, y, "lizard", 200, 300, 50, 200, 0, 2, 30, 0.4, ctx, eventSpawned, 6);
        this.patternTimer = 0;
        this.thrown = false;
        this.pattern = "walk";
    }
    static createFromDict(data) {
        let o = new Lizard(data.x, data.y, data.eventSpawned)
        o.loadData(data)
        return o
    }
    draw(dur) {

        drawShadow(this.x, this.y + 0.45 * this.h, 0.3 * this.w, ctxShadow);
        let frame;

        if (this.pattern == "walk") {
            this.action = Math.floor(2 * this.angle / Math.PI + 3.5) % 4

            let frameCount = sprites[this.sprite].frames
            if (this.stunTimer <= 0 && !this.dead) {
                this.frameTimer += dur;
                if (this.frameTimer > this.timePerFrame * frameCount) {
                    this.frameTimer -= this.timePerFrame * frameCount;
                    this.onAnimationLoopReset()
                }
            }
            frame = Math.floor(this.frameTimer / this.timePerFrame) % frameCount;
        }
        else if (this.pattern == "wait") {
            this.action = Math.floor(2 * this.angle / Math.PI + 3.5) % 4
            frame = 0;
        }
        else if (this.pattern == "throw") {
            this.action = 4
            let throwTime = this.patternTimer - 5;
            if (throwTime < 1) frame = 3;
            if (throwTime < 3) frame = 2;
            if (throwTime < 5) frame = 1;
            if (throwTime < 6) frame = 0;
            if (throwTime < 6.5) frame = 1;
            if (throwTime < 6.75) frame = 2;
            if (throwTime < 7) frame = 3;
        }
        else if (this.pattern == "spin") {
            this.action = 5

            let frameCount = sprites[this.sprite].frames
            if (this.stunTimer <= 0 && !this.dead) {
                this.frameTimer += 2 * dur;
                if (this.frameTimer >  this.timePerFrame * frameCount) {
                    this.frameTimer -= this.timePerFrame * frameCount;
                }
            }
            frame = Math.floor(this.frameTimer / this.timePerFrame) % frameCount;
        }




        let redBlink = 0;
        if (Math.floor(this.tookDamageTimer / 0.1) % 2 == 1) redBlink = 1;
        drawSprite(this.sprite, this.x - this.w/2, this.y - this.h/2, this.w, this.h, frame, this.drawAngle, this.context, this.action + redBlink * this.actionCount);
    }

    doAttack(angle, dur) {
        this.patternTimer += dur;
        if (this.patternTimer < 5) {
            this.speed = 200;
            this.walkTo(player.hex)
            this.pattern = "walk"
        }
        else if (!this.thrown && this.patternTimer < 12) {
            this.pattern = "throw"
            this.vx = 0;
            this.vy = 0;
            this.angle = angle
            if (this.patternTimer > 9) {
                this.thrown = true;
                playSound("lizard_throw", this.x, this.y, 0.8)
                new Boulder(this.x + this.size * Math.cos(angle), this.y + this.size * Math.sin(angle), angle)
            }
        }
        else if (this.patternTimer < 12) {
            this.vx = 0;
            this.vy = 0;
            this.pattern = "wait"
        }
        else if (this.patternTimer < 15) {
            this.pattern = "spin"
            this.speed = 400;
            this.walkTo(player.hex)
        }
        else {
            this.patternTimer = 0;
            this.thrown = false;
        }
    }
    
    updatePlayerAggro(disSq, dur) {
        this.aggroCheckTimer += dur;
        if (this.aggroCheckTimer > 2) {
            this.aggroCheckTimer -= 2*Math.random();
            let tileRange = 10;
            if (wasInCombat) tileRange *= 2;
            let path = map.findPathFromTo(this.hex, player.hex, tileRange, this.getAttackRangeSq() != 0)
            this.onAggro = path != null;
        }
    }

    onMeleeAttack(angle) {
        playSound("lizard_roar", this.x, this.y, 0.2)
        player.damage(999);
    }
    onDamage() {
        playSound("lizard_growl", this.x, this.y, 0.4)
        this.patternTimer = 0;
        this.thrown = false;
    }
    onDeath() {
        playSound("lizard_death", this.x, this.y, 1.0)
        endGameTimer = 1;
    }
    onAnimationLoopReset() {
        playSound("lizard_walk", this.x, this.y, 0.2)
    }
    getAttackRangeSq() {
        return 1000*1000;
    }
}