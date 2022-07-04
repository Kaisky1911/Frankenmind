// < > |

class Collectible extends GameObject {
    constructor(x, y) {
        super(x, y);
    }

    update(dur) {
        if (!levelEditorEnabled) {
            if (this.hex.objects.has(player)) {
                this.effect(dur);
            }
            else {
                this.effectOff(dur);
            }
        }
    }
    effectOff(dur) {}
}

class Heart extends Collectible {
    constructor(x, y) {
        super(x, y);
        this.size = 20;
        this.timer = 0;
        this.yOff = 0;
    }
    static createFromDict(data) {
        let o = new Heart(data.x, data.y)
        o.loadData(data)
        return o
    }

    draw(dur) {
        this.timer += dur;
        this.yOff = 5 * Math.sin(3 * this.timer);
        drawSprite("heart2", this.x - this.size, this.y + this.yOff - this.size, this.size * 2, this.size * 2);
        drawShadow(this.x, this.y + this.size, this.size, ctxShadow)
    }

    effect(dur) {
        //if (player.hp != player.maxHp) {
            playSound("heart", this.x, this.y, 0.4);
            player.heal(2);
            this.delete();
        //}
    }
}

class Lever extends Collectible {
    constructor(q, r, dq, dr) {
        let hex = map.get(q, r)
        super(hex.x, hex.y);
        this.size = 20;
        this.on = false;
        this.w = 20;
        this.h = 30;
        this.dq = dq;
        this.dr = dr;
        this.eventSpawned = true;
    }
    static createFromDict(data) {
        let o = new Lever(data.x, data.y, data.q, data.r)
        o.loadData(data)
        return o
    }


    draw(dur) {
        let frame = 0;
        if (this.on) frame = 1;
        drawSprite("lever", this.x - this.w/2, this.y - this.h/2, this.w, this.h, frame);
        drawShadow(this.x, this.y + this.h/2, this.w/2, ctxShadow)
    }

    effect(dur) {
        if (!this.on) {
            playSound("lever", this.x, this.y, 0.4);
            this.on = true;
            let hex = map.get(this.dq, this.dr);
            if (hex.type == "door") hex.open();
        }
    }
}

class Sign extends Collectible {
    constructor(q, r, text) {
        let hex = map.get(q, r)
        super(hex.x, hex.y);
        this.size = 50;
        this.text = text;
        this.w = 96;
        this.h = 96;
        this.timer = 0;
        this.eventSpawned = true;
        if (this.hex.objects.has(player)) {
            this.hex.objects.delete(player);
            this.hex.objects.add(player);
        }
    }
    static createFromDict(data) {
        let o = new Sign(data.x, data.y)
        o.loadData(data)
        return o
    }


    draw(dur) {
        drawSprite("sign", this.x - this.w/2, this.y - this.h, this.w, this.h, 0);
        drawShadow(this.x, this.y, this.w/3, ctxShadow)
    }

    effect(dur) {
        this.timer -= dur;
        if (this.timer <= 0) {
            doVisualEffect(new EffectNumberPop(player.x, player.y - 2 * player.size, this.text, [1.0, 1.0, 1.0], 25, 2))
            this.timer += 2;
        }
    }
    
    effectOff(dur) {
        this.timer = 0;
    }
}

class Save extends Collectible {
    constructor(q, r) {
        let hex = map.get(q, r)
        super(hex.x, hex.y);
        this.size = 50;
        this.w = 96;
        this.h = 96;
        this.timer = 0;
        this.eventSpawned = true;
        if (this.hex.objects.has(player)) {
            this.hex.objects.delete(player);
            this.hex.objects.add(player);
        }
    }
    static createFromDict(data) {
        let o = new Save(data.x, data.y)
        o.loadData(data)
        return o
    }


    draw(dur) {
        drawSprite("save", this.x - this.w/2, this.y - this.h, this.w, this.h, 0);
        drawShadow(this.x, this.y, this.w/3, ctxShadow)
    }

    effect(dur) {
        this.timer -= dur;
        if (this.timer <= 0) {
            if (isInCombat || wasInCombat) {
                doVisualEffect(new EffectNumberPop(player.x, player.y - 2 * player.size, "can't save during combat!", [1.0, 1.0, 1.0], 25, 2))
            }
            else {
                saveGame();
                doVisualEffect(new EffectNumberPop(player.x, player.y - 2 * player.size, "game saved!", [1.0, 1.0, 1.0], 25, 2))
            }
            this.timer += 2;
        }
    }
    
    effectOff(dur) {
        this.timer = 0;
    }
}