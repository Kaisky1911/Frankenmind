// < > |
// Hex Grid Map
class Map {
    constructor() {
        this.data = Map.createMapDataFromDict(mapData)
    }

    draw() {
        let q0 = Map.toHexPosQ(player.viewX0, player.viewY0);
        let r0 = Map.toHexPosR(player.viewX0, player.viewY0);
        let q1 = Map.toHexPosQ(player.viewX1, player.viewY1);
        let r1 = Map.toHexPosR(player.viewX1, player.viewY1);
        for (let r = r0 - 1; r <= r1 + 1; r++) {
                let q0_row = Math.round(q0 - (r - r0) / 2) - 1
                let q1_row = Math.round(q1 + (r1 - r) / 2) + 1
                for (let q = q0_row - 1; q <= q1_row + 1; q++) {
                    let hex = this.get(q, r);
                    hex.drawFloor();
                }
        }
        
        if (player.ball.state == "attached") {
            player.drawRope();
        }
        for (let r = r0 - 1; r <= r1 + 1; r++) {
                let q0_row = Math.round(q0 - (r - r0) / 2) - 1
                let q1_row = Math.round(q1 + (r1 - r) / 2) + 1
                for (let q = q0_row - 1; q <= q1_row + 1; q++) {
                    let hex = this.get(q, r);
                    hex.drawOther();
                }
        }
    }

    get(q, r) {
        let key = `${q} ${r}`;
        if (key in this.data) return this.data[key];
        else {
            let hex = new Hex(q, r);
            this.data[key] = hex
            return hex;
        }
    }
    set(q, r, hex) {
        let key = `${q} ${r}`;
        this.data[key] = hex;
    }

    doMoveCollision(o) {
            let hexs = this.getHexNeighboorHood(Map.toHexPosQ(o.x, o.y), Map.toHexPosR(o.x, o.y))
            for (let hex of hexs) {
                if (hex.solid || hex.isPit) {
                    let dx = o.x - hex.x;
                    let dy = o.y - hex.y;
                    let disSq = dx*dx + dy*dy;
                    let minDis = o.constructor.size + Hex.size;
                    if (disSq < minDis*minDis) { // overlap
                        if (dx*o.vx + dy*o.vy < 0) { // checks if the obj is actually moving towards the hex (dot product)
                            let angle = Math.atan2(dy, dx);
                            o.x = hex.x + minDis * Math.cos(angle);
                            o.y = hex.y + minDis * Math.sin(angle);
                        }
                    }
                }
            }
    }

    getHexNeighboorHood(q, r) { // returns the hex and all its 6 neighboors on that position in an array
        return [
            map.get(q, r),
            map.get(q+1, r),
            map.get(q, r+1),
            map.get(q-1, r+1),
            map.get(q-1, r),
            map.get(q, r-1),
            map.get(q+1, r-1)
        ]
    }

    hexAtXY(x, y) {
        let r = Math.round(y / Map.hexGridHeight);
        let q = Math.round((x / Hex.size - r) / 2);
        return this.get(q, r);
    }

    saveToString() {
        let mapData = {}
        
        for (const [key, hex] of Object.entries(this.data)) {
            mapData[key] = {
                "q": hex.q,
                "r": hex.r,
                "type": hex.type,
                "sprite": hex.sprite,
                "spriteFrame": hex.spriteFrame,
            }
        }
        return JSON.stringify(mapData);
    }

    static createMapDataFromString(mapString) {
        return createMapDataFromDict(JSON.parse(mapString))
    }

    static createMapDataFromDict(mapdata) {
        let data = {}
        for (const [key, hex] of Object.entries(mapdata)) {
            data[key] = new Hex(hex.q, hex.r, hex.type);
            data[key].sprite = hex.sprite;
            data[key].spriteFrame = hex.spriteFrame;
        }
        return data
    }
    
    static toHexPosQ(x, y) {
            var r = Math.round(y / Map.hexGridHeight);
            return Math.round((x / Hex.size - r) / 2);
    }
    
    static toHexPosR(x, y) {
            return Math.round(y / Map.hexGridHeight);
    }
    
    static fromHexPosX(q, r) {
        return (2 * q + r) * Hex.size;
    }
    
    static fromHexPosY(q, r) {
        return r * Map.hexGridHeight;
    }

    static hexGridHeight = Hex.size * 3/2 * Hex.yxRatio // the vertical distance between two hex diagonally on top of each other
}



function saveMap() {
    var mapString = "var mapData = " + map.saveToString()

    var a = document.createElement("a");
    a.href = window.URL.createObjectURL(new Blob([mapString], {type: "text/plain"}));
    a.download = "mapData.js";
    a.click();
}

function loadMap() {
    let input = document.createElement('input');
    input.type = 'file';

    input.onchange = e => { 
        let file = e.target.files[0]; 
        let reader = new FileReader();
        reader.onload = readerEvent => {
            var mapString = readerEvent.target.result.slice(14);
            map.data = Map.createMapDataFromString(mapString)
        }
        reader.readAsText(file,'UTF-8');
    }
    input.click();
}