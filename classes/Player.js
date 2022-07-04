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
        this.disableNextAction1PressRelease = false;
        this.size = Player.size;
        this.speechTimer = 0;
        this.speeches = {
            "hurt": {
                "prob": 1.0,
                "overlap": true,
                "versions": ["Player__NewLines_23", "Player__NewLines_25", "Player_Speech_0", "Player_Speech_1", "Player_Speech_2", "Player_Speech_3", "Player_Speech_4"]
            },
            "throwbrain": {
                "prob": 0.3,
                "overlap": false,
                "versions": ["Player__NewLines_12", "Player__NewLines_22"]
            },
            "pullbrain": {
                "prob": 0.3,
                "overlap": false,
                "versions": ["Player__NewLines_13", "Player__NewLines_14", "Player__NewLines_15", "Player__NewLines_16", ]
            },
            "hitenemy": {
                "prob": 0.3,
                "overlap": false,
                "versions": ["Player_Speech_9", "Player_Speech_6", "Player_Speech_7"]
            },
            "hitwall": {
                "prob": 0.3,
                "overlap": false,
                "versions": ["Player_Speech_5", "Player_Speech_10", "Player_Speech_11"]
            },
            "lowhp": {
                "prob": 0.3,
                "overlap": false,
                "versions": ["Player__NewLines_9", "Player__NewLines_24", "Player__NewLines_26", "Player__NewLines_27"]
            },
            "snakes": {
                "prob": 0.3,
                "overlap": false,
                "versions": ["Player__NewLines_10", "Player__NewLines_11"]
            },
            "breakwall": {
                "prob": 1.0,
                "overlap": false,
                "versions": ["Player__NewLines_17", "Player__NewLines_18", "Player__NewLines_19", "Player__NewLines_20", "Player__NewLines_21", "Player_Speech_12", "Player__NewLines_30"]
            },
            "lostbrain": {
                "prob": 1.0,
                "overlap": false,
                "versions": ["Player__NewLines_1", "Player__NewLines_2", "Player__NewLines_3", "Player__NewLines_4", "Player__NewLines_5", "Player__NewLines_6", "Player__NewLines_7", "Player__NewLines_8", "Player__NewLines_28", "Player__NewLines_29"]
            },
        }
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
        
        let action = this.walkingDir;
        if (Math.floor(this.tookDamageTimer / 0.1) % 2 == 1) {
            action += 4
        }

        drawSprite(Player.spriteKey, this.x - Player.size, this.y - Player.size, 2 * Player.size, 2 * Player.size, frame, angle, ctx, action);
        drawShadow(this.x, this.y + 0.8 * Player.size, 0.7 * Player.size, ctxShadow);
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
        ctx.moveTo(ball.x    - this.viewX0, ball.y - this.viewY0);
        ctx.lineTo(ball.x    - this.viewX0 + 1000 * Math.cos(angle), ball.y - this.viewY0 + 1000 * Math.sin(angle));
        ctx.stroke();
    }

    heal(val) {
        this.hp += val;
        if (this.hp > this.maxHp) this.hp = this.maxHp;
    }

    damage(dmg) {
        if (levelEditorEnabled) return;
        if (dmg > 0) {
            if (!this.dead) doVisualEffect(new EffectNumberPop(this.x, this.y - Player.size, dmg, [1.0, 0, 0], 40))
            this.hp -= dmg;
            this.tookDamageTimer = 0.5;
            if (this.hp <= 0) {
                this.dead = true;
                return;
            }
            else {
                if (this.hp <= 3) this.doSpeech("lowhp");
                else this.doSpeech("hurt");
            }
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
        if (this.speechTimer >= 0) this.speechTimer -= dur;
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
        else {
            if (ball.onLava) this.damage(1);
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
        }
    }
    
    action1Press() {
        if (this.action1pressed) return; // avoid multiple calls when holding the key
        this.action1pressed = true;
        if (ball.state == "attached") {
            this.slowMowTime = 0;
            this.slowMowState = "fadingin"; // fancy slowmow while holding mouse for better aiming (could use some bassy sound effects)
        }
        else if (ball.state == "free") {
            player.doSpeech("pullbrain")
            ball.returnToPlayer();
        }
    }
    action1Release() {
        this.action1pressed = false;
        
        if (this.disableNextAction1PressRelease) {
            this.disableNextAction1PressRelease = false;
            return;
        }
        if (ball.state == "attached") {
            this.detachBall();
            this.doSpeech("throwbrain");
        }
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

    doSpeech(speechKey) {
        if (speechKey in this.speeches) {
            let speech = this.speeches[speechKey]
            if (!speech.overlap && this.speechTimer > 0) return;
            if (Math.random() < speech.prob) {
                let v = Math.floor(Math.random() * speech.versions.length)
                playSound(speech.versions[v], this.x, this.y, 0.4);
                if (!speech.overlap) this.speechTimer = 2.0;
            }
        }
        else console.log("error: cant find speech called " + speechKey)
    }

    
    static size = 30; // size is in radius, so the sprite size is double (radius is easier for circular collision detection)
    static spriteKey = "player";
    static moveSpeed = 300.0;
    static maxSlowMowTime = 10.0;
    static slowMowFadeInTime = 0.4;
    static slowMowFadeOutTime = 0.2;
    static slowMowSpeed = 0.1;
    static handLength = 30;
}