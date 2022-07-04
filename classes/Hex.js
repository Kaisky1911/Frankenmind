// < > |
class Hex {
    constructor(q, r, data, type="wall") {
        this.q = q;
        this.r = r;
        this.x = Map.fromHexPosX(q, r)
        this.y = Map.fromHexPosY(q, r)
        this.objects = new Set([]);
        this.neighboors = [null, null, null, null, null]
        Map.connectNeighboorhood(data, this, q, r);
        this.setType(type)
        this.oldtype = null
        this.oldsprite = null
        this.beingPushedDir = null
        this.beingPushedTimer = 0
        this.isGettingPushedOn = false;
        this.frameTimer = 0;
        this.aniFrame = 0;
    }
    draw(dur) {
        let context = ctx;
        if (!this.solid) {
            context = ctxBack
        }
        if (this.type == "lava") {
            this.frameTimer -= dur
            if (this.frameTimer <= 0) {
                this.frameTimer = 0.5 + Math.random()
                this.aniFrame = (this.aniFrame + 1) % 2
            }
            drawSprite(this.sprite, this.x - Hex.size, this.y - Hex.yRenderSize, 2 * Hex.size, 2 * Hex.yRenderSize, this.aniFrame, 0, context)
        }
        else {
            if (this.oldsprite != null) {
                for (let frame of this.oldspriteFrames) {
                    drawSprite(this.oldsprite, this.x - Hex.size, this.y - Hex.yRenderSize, 2 * Hex.size, 2 * Hex.yRenderSize, frame, 0, ctxBack)
                }
            }
            for (let frame of this.spriteFrames) {
                if (this.beingPushedDir != null) {
                    let angle = this.beingPushedDir * Math.PI / 3
                    let offX = 4 * Hex.size * this.beingPushedTimer * Math.cos(angle)
                    let offY = 4 * Hex.size * this.beingPushedTimer * Math.sin(angle)
                    drawSprite(this.sprite, this.x - Hex.size + offX, this.y - Hex.yRenderSize + offY, 2 * Hex.size, 2 * Hex.yRenderSize, frame, 0, context)
                }
                else drawSprite(this.sprite, this.x - Hex.size, this.y - Hex.yRenderSize, 2 * Hex.size, 2 * Hex.yRenderSize, frame, 0, context)
            }
            if (this.solid && this.type != "door") {
                // shadow
                let x = this.x - player.viewX0 + 0.8 * Hex.size;
                let y = this.y - player.viewY0 - 0.4 * Hex.size;
                let yOff = 0.5 * Hex.size * Hex.yxRatioconsole
                ctxShadow.fillStyle = "black";
                ctxShadow.beginPath();
                ctxShadow.moveTo(x + Hex.size, y - yOff);
                ctxShadow.lineTo(x + Hex.size, y + yOff);
                ctxShadow.lineTo(x, y + Hex.yxRatio * Hex.size);
                ctxShadow.lineTo(x - Hex.size, y + yOff);
                ctxShadow.lineTo(x - Hex.size, y - yOff);
                ctxShadow.lineTo(x, y - Hex.yxRatio * Hex.size);
                ctxShadow.closePath();
                ctxShadow.fill();
            }
        }
        for (let o of this.objects) {
            o.draw(dur);
        }
    }

    update(dur) {
        for (let o of this.objects) {
            o.update(dur);
        }
        if (this.beingPushedDir != null) {
            this.beingPushedTimer += dur;
            if (this.beingPushedTimer > 0.5) {
                this.pushWallDone(this.beingPushedDir)
            }
        }
    }

    gotHit(x, y, speed, angle) {
        if (this.type == "wallDestroyable") {
            if (speed > 800) {
                let dmg = Math.floor(speed / 800)
                doVisualEffect(new EffectWallDamage(x, y, Math.floor(speed / 50)));
                this.spriteFrames[0] = Math.min(3, this.spriteFrames[0] + dmg);
                if (this.spriteFrames[0] == 3) {
                    this.solid = false;
                    doVisualEffect(new EffectWallDamage(this.x, this.y, 20));
                    let sound = "wall_break_" + Math.floor(1 + Math.random() * 2)
                    playSound(sound, this.x, this.y, Math.min(speed / 3000, 1.0));
                    player.doSpeech("breakwall");
                }
                else {
                    let sound = "wall_hit_" + Math.floor(1 + Math.random() * 2)
                    playSound(sound, this.x, this.y, Math.min(speed / 3000, 1.0));
                    player.doSpeech("hitwall");
                }
            }
        } else if (this.type == "wallMovable" && this.beingPushedDir == null) {
            if (speed > 800) {
                let dir = Math.floor(angle / Math.PI * 3 + 6.5) % 6;
                let nb = this.neighboors[dir]
                if (nb != null && !nb.solid && !nb.isGettingPushedOn) this.pushWall(dir)
                else {
                    dir = (dir + 3) % 6
                    nb = this.neighboors[dir]
                    if (nb != null && !nb.solid && !nb.isGettingPushedOn) this.pushWall(dir)
                }
            }
            
        } else {
            playSound("wall_bump", this.x, this.y, Math.min(speed / 3000, 1.0));
        }
    }

    pushWall(dir) {
        this.beingPushedDir = dir;
        playSound("wall_move", this.x, this.y, 0.4);
        this.neighboors[dir].isGettingPushedOn = true;
        if (this.oldtype == null) {
            this.oldtype = "floor";
            this.oldsprite = "floor";
            this.oldspriteFrames = [Math.floor(Math.random() * 2 + 4)];
        }
    }

    pushWallDone(dir) {
        this.neighboors[dir].isGettingPushedOn = false;
        this.beingPushedDir = null;
        this.beingPushedTimer = 0;
        playSound("wall_fall", this.x, this.y, 0.4);
        this.type = this.oldtype 
        this.sprite = this.oldsprite
        this.spriteFrames = this.oldspriteFrames
        this.solid = false;
        if (this.neighboors[dir].isPit) {
            this.neighboors[dir].isPit = false
            this.neighboors[dir].sprite = "wallMovableSunken"
            this.neighboors[dir].spriteFrames = [0]
        }
        else {
            this.neighboors[dir].oldtype = this.neighboors[dir].type;
            this.neighboors[dir].oldsprite = this.neighboors[dir].sprite;
            this.neighboors[dir].oldspriteFrames = this.neighboors[dir].spriteFrames;
            this.neighboors[dir].type = "wallMovable";
            this.neighboors[dir].sprite = "wallMovable";
            this.neighboors[dir].spriteFrames = [0];
            this.neighboors[dir].solid = true;
        }
    }

    loadObject(o) {
        this.objects.add(o)
    }
    deloadObject(o) {
        this.objects.delete(o)
    }
    open() {
        this.type = "floor";
        this.sprite = "floor";
        this.solid = false;
        this.spriteFrames[0] += 4
    }
    
    clearObjects() {
        let hasPlayer = false;
        let hasBall = false;
        if (this.objects.has(player)) {
            hasPlayer = true;
        }
        if (this.objects.has(ball)) {
            hasBall = true;
        }
        this.objects = new Set()
        if (hasPlayer) this.objects.add(player);
        if (hasBall) this.objects.add(ball);
    }
    
    setType(type) {
        if (this.type == type) {
            if (type == "pit") this.updatePitFrames();
            return;
        }
        if (type == "wall") {
            this.sprite = "wall";
            this.spriteFrames = [Math.max(0, Math.floor(Math.random() * 16) - 11)]
            this.solid = true;
            this.isPit = false;
        }
        else if (type == "wallDestroyable") {
            this.sprite = "wallDestroyable";
            this.spriteFrames = [0];
            this.solid = true;
            this.isPit = false;
        }
        else if (type == "wallMovable") {
            if (this.isPit) {
                this.sprite = "wallMovableSunken"
                this.solid = false;
            }
            else {
                if (!this.solid && this.type != null) {
                    this.oldtype = this.type 
                    this.oldsprite = this.sprite
                    this.oldspriteFrames = this.spriteFrames
                }
                else {
                    this.oldtype = "floor"
                    this.oldsprite = "floor"
                    this.oldspriteFrames = [Math.floor(Math.random() * 2 + 4)]
                }
                this.sprite = "wallMovable";
                this.solid = true;
            }
            this.spriteFrames = [0];
            this.isPit = false;
        }
        else if (type == "floor") {
            this.sprite = "floor";
            this.spriteFrames = [Math.floor(Math.random() * 2 + 4)];
            this.solid = false;
            this.isPit = false;
        }
        else if (type == "lava") {
            this.sprite = "lava";
            this.spriteFrames = [Math.floor(Math.random() * 2)];
            this.solid = false;
            this.isPit = false;
        }
        else if (type == "door") {
            this.sprite = "door";
            this.spriteFrames = [0];
            this.solid = true;
            this.isPit = false;
        }
        else if (type == "dooropen") {
            this.sprite = "door";
            this.spriteFrames = [0];
            this.solid = false;
            this.isPit = false;
        }
        else if (type == "pit") {
            this.sprite = "pit";
            this.updatePitFrames();
            this.solid = false;
            this.isPit = true;
        }
        if (!type.isPit) {
            for (let nb of this.neighboors) {
                if (nb != null && nb.type == "pit") nb.updatePitFrames()
            }
        }
        this.type = type
    }

    updatePitFrames() {
        this.spriteFrames = [];
        let i = 0;
        for (let nb of this.neighboors) {
            if (nb == null || (!nb.isPit && nb.sprite != "wallMovableSunken")) this.spriteFrames.push(i);
            else if (nb.isPit) {
                let j = (i + 3) % 6
                let index = nb.spriteFrames.indexOf(j)
                if (index != -1) {
                    nb.spriteFrames.splice(index, 1)
                }
            }
            i += 1;
        }
        this.spriteFrames = this.spriteFrames.reverse();
    }

    toggleFrames() {
        if (this.spriteFrames.length != 0) this.spriteFrames[0] = (this.spriteFrames[0] + 1) % sprites[this.sprite].frames
    }

    static yxRatio = 2 / Math.sqrt(3);
    static size = 48;
    static yRenderSize = Math.round(Hex.size * Hex.yxRatio);
}