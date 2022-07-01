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
        new GameEvent(200, 200, 500, 0, "gameEvent1"),
        new GameEvent(5500, -600, 700, 10, "gameEvent2")
    ]
}

function gameEvent1(count, dur) {
    if (count == 0) saveGame();
    new Bat(3000, 0);
    new Bat(5800, -400);
    new Bat(5600, -200);
    new Bat(5500, -600);
}
function gameEvent2(count, dur) {
    if (count == 0) saveGame();
    while (Math.random() < dur) {
        let a = Math.random() * Math.PI * 2
        new Bat(1000 * Math.cos(a) + player.x, 1000 * Math.sin(a) + player.y, true);
    }
}

const gameEventList = {
    "gameEvent1": gameEvent1,
    "gameEvent2": gameEvent2
}
