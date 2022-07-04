// < > |

class GameObject {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.hex = map.hexAtXY(this.x, this.y);
        this.hex.loadObject(this);
        this.onHexChange()
        this.constructorName = this.constructor.name
        this.eventSpawned = false;
    }
    loadData(data) {
        for (let [key, value] of Object.entries(data)) {
            this[key] = value;
        }
    }
    stringify() {
        let hex = this.hex
        this.hex = null;
        let str = JSON.stringify(this);
        this.hex = hex;
        return str;
    }

    delete() {
        this.hex.objects.delete(this);
    }
    
    updateHex() {
        let hex = map.hexAtXY(this.x, this.y);
        if (hex != this.hex) {
            this.hex.deloadObject(this);
            this.hex = hex;
            this.hex.loadObject(this);
            this.onHexChange();
        }
    }

    onHexChange() {
        this.onLava = this.hex.type == "lava"
    }

    checkSingleObjectCollision(o) {
        let dx = o.x - this.x;
        let dy = o.y - this.y;
        let disSq = dx*dx + dy*dy;
        let minDis = o.size + this.size;
        return disSq < minDis*minDis;
    }

    checkObjectCollision() {
        let hexs = [this.hex]
        for (let hex of this.hex.neighboors) hexs.push(hex);
        for (let hex of hexs) {
            for (let o of hex.objects) {
                if ("size" in o) {
                    if (this.checkSingleObjectCollision(o)) {
                        return o;
                    }
                }
            }
        }
        return null;
    }

}


class LavaController extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.timer = 0;
        this.setting = 0;
        this.settings = [1, 2, 4, 8]
        this.period = this.settings[this.setting]
        doVisualEffect(new EffectNumberPop(this.x, this.y, this.period, [1.0, 1.0, 1.0], 20))
    }
    static createFromDict(data) {
        let o = new LavaController(data.x, data.y)
        o.loadData(data)
        return o
    }

    draw(dur) {}
    update(dur) {
        this.timer += dur;
        if (this.timer > this.period) {
            this.timer -= this.period;
            if (this.hex.type == "lava") this.hex.setType("floor")
            else this.hex.setType("lava")
        }
    }
    toggleSetting() {
        this.setting = this.setting + 1
        if (this.setting == 4) {
            doVisualEffect(new EffectNumberPop(this.x, this.y, "deleted", [1.0, 1.0, 1.0], 20))
            this.delete();
            return;
        }
        this.period = this.settings[this.setting]
        doVisualEffect(new EffectNumberPop(this.x, this.y, this.period, [1.0, 1.0, 1.0], 20))
    }
}