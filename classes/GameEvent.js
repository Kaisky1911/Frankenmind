// < > |

class GameEvent extends GameObject {
    constructor(x, y, range, dur, effect) {
        super(x, y);
        this.range = range;
        this.rangeSq = range*range;
        this.dur = dur;
        this.effect = effect;
        this.on = false;
        this.done = false;
        this.count = 0;
    }
    static createFromDict(data) {
      let o = new GameEvent(data.x, data.y, data.range, data.dur, data.effect)
      o.loadData(data)
      return o
    }

    update(dur) {
        if (levelEditorEnabled) return;
        if (this.done) {
            this.delete();
            return;
        }
        if (this.on) { 
            this.dur -= dur;
            if (this.dur <= 0) {
                this.done = true;
            }
            else {
                gameEventList[this.effect](this.count, dur);
                this.count += 1;
            }
        }
        else {
            let dx = this.x - player.x;
            let dy = this.y - player.y;
            if (dx*dx + dy*dy < this.rangeSq) {
                gameEventList[this.effect](this.count, dur);
                this.count += 1;
                this.on = true;
            }
        }
    }
    draw() {}
}




var gameEvents;
function initGameEvents() {
    gameEvents = [
        new GameEvent(200, 200, 1e6, 0, "gameEvent1"),
        new GameEvent(5500, -600, 700, 10, "gameEvent2")
    ]
}

function gameEvent1(count, dur) {
    if (count == 0) {
        saveGame();
        saveGame("leveleditor");
    }
    map.get(39, 2).spriteFrames[0] = 2;
    new Sign(1, 2, "WASD or Arrow Keys to move!")
    new Sign(19, 0, "Swing your brain by moving! It can even destroys some Walls!")
    new Sign(35, -1, "Hold your Space Key while swinging fast to slow down time... and release!")
    new Sign(47, -2, "Your brain does DOUBLE damage while released!")
    new Sign(82, -28, "Some walls may not be destroyed... but moved by brain power!")
    new Sign(114, -67, "You can walk on lava. But your brain cannot. Be careful!")
    
    new Save(42, 1);
    new Save(84, -34);
    new Save(59, -31);
    new Save(53, -37);
    new Save(40, -31);

    new Lever(116, -71, 100, -55)
    new Lever(72, -24, 60, -33)
    new Lever(57, -36, 64, -41)
    new Lever(74, -53, 64, -47)
    new Lever(22, -54, 37, -31)
    new Lever(6, -6, 45, -24)
}
function gameEvent2(count, dur) {
    while (Math.random() < dur) {
        let a = Math.random() * Math.PI * 2
        //new Bat(1000 * Math.cos(a) + player.x, 1000 * Math.sin(a) + player.y, true);
    }
}

const gameEventList = {
    "gameEvent1": gameEvent1,
    "gameEvent2": gameEvent2
}
