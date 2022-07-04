// < > |
// Hex Grid Map
class Map {
    constructor() {
        this.data = {}
    }

    draw(dur) {
        let q0 = Map.toHexPosQ(player.viewX0, player.viewY0);
        let r0 = Map.toHexPosR(player.viewX0, player.viewY0);
        let q1 = Map.toHexPosQ(player.viewX1, player.viewY1);
        let r1 = Map.toHexPosR(player.viewX1, player.viewY1);
        for (let r = r0 - 1; r <= r1 + 1; r++) {
            let q0_row = Math.round(q0 - (r - r0) / 2) - 1
            let q1_row = Math.round(q1 + (r1 - r) / 2) + 1
            for (let q = q0_row - 1; q <= q1_row + 1; q++) {
                let hex = this.get(q, r);
                hex.draw(dur);
            }
        }
    }

    update(dur) {
        let range = 20;
        let q0 = Map.toHexPosQ(player.x, player.y);
        let r0 = Map.toHexPosR(player.x, player.y);
        for (let r = -range; r <= range; r++) {
            var q_start;
            var q_end;
            if (r < 0) {
                q_start = -r -range;
                q_end = range;
            }
            else {
                q_start = -range;
                q_end = range - r;
            }
            for (let q = q_start; q <= q_end; q++) {
                let hex = this.get(q0 + q, r0 + r);
                for (let o of hex.objects) {
                    o.update(dur);
                }
            }
        }
    }

    get(q, r) {
        let key = `${q} ${r}`;
        if (key in this.data) return this.data[key];
        else {
            let hex = new Hex(q, r, this.data);
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
                    let minDis = o.size + Hex.size;
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
        let hex = map.get(q, r);
        let hexs = [hex]
        for (let nb of hex.neighboors) {
            hexs.push(nb);
        }
        return hexs;
    }

    hexAtXY(x, y) {
        let r = Math.round(y / Map.hexGridHeight);
        let q = Math.round((x / Hex.size - r) / 2);
        return this.get(q, r);
    }

    findPathFromTo(startHex, endHex, maxIt = 20, walkOverPits=false) {
        let lookedHexs = new Set([])
        let frontHexs = new Set([startHex])
        let it = 0;
        while (it++ < maxIt) {
            let newFrontHexs = new Set([])
            for (let hex of frontHexs) {
                for (let nb of hex.neighboors) {
                    if (nb != null && !lookedHexs.has(nb) && !frontHexs.has(nb) && !newFrontHexs.has(nb) && !nb.solid && (walkOverPits || !nb.isPit)) {
                        newFrontHexs.add(nb)
                        nb.path = hex
                        if (nb == endHex) {
                            let path = []
                            let front = endHex;
                            for (let i = 0; i < maxIt; i++) {
                                path.push(front)
                                front = front.path
                                if (front == startHex) {
                                    return path;
                                }
                            }
                            return null;
                        }
                    }
                }
            }
            for (let hex of frontHexs) {
                lookedHexs.add(hex);
            }
            frontHexs = newFrontHexs
        }
        return null;
    }

    stringify(saveObjects=false, saveEventObjects=true) {
        let mapData = {}
        
        for (const [key, hex] of Object.entries(this.data)) {
            mapData[key] = {
                "q": hex.q,
                "r": hex.r,
                "type": hex.type,
                "sprite": hex.sprite,
                "spriteFrames": hex.spriteFrames,
            }
            if (saveObjects) {
                mapData[key]["objects"] = []
                for (let o of hex.objects) {
                    if (saveEventObjects || !o.eventSpawned) mapData[key]["objects"].push(o.stringify())
                }
            }
        }
        return JSON.stringify(mapData);
    }

    randomizeTextures() {
        for (const [key, hex] of Object.entries(map.data)) {
            hex.setType(hex.type)
        }
    }

    static connectNeighboorhood(data, hex, q, r) {
        hex.neighboors[0] = Map.connectNeighboor(data, q+1, r, 3, hex)
        hex.neighboors[1] = Map.connectNeighboor(data, q, r+1, 4, hex)
        hex.neighboors[2] = Map.connectNeighboor(data, q-1, r+1, 5, hex)
        hex.neighboors[3] = Map.connectNeighboor(data, q-1, r, 0, hex)
        hex.neighboors[4] = Map.connectNeighboor(data, q, r-1, 1, hex)
        hex.neighboors[5] = Map.connectNeighboor(data, q+1, r-1, 2, hex)
    }

    static connectNeighboor(data, q, r, id, nb) {
        let key = `${q} ${r}`;
        if (!(key in data)) return null;
        let hex = data[key];
        hex.neighboors[id] = nb;
        return hex;
    }

    static createMapDataFromString(mapString, loadPlayer=true) {
        return Map.createMapDataFromDict(JSON.parse(mapString), loadPlayer)
    }

    static createMapDataFromDict(mapdata, loadPlayer=true) {
        let data = {}
        for (const [key, hexData] of Object.entries(mapdata)) {
            let hex = new Hex(hexData.q, hexData.r, data, hexData.type);
            data[key] = hex;
            hex.sprite = hexData.sprite;
            hex.spriteFrames = hexData.spriteFrames;
            if ("objects" in hexData) {
                for (let objStr of hexData.objects) {
                    let objData = JSON.parse(objStr);
                    if (loadPlayer || (objData.constructorName != "Ball" && objData.constructorName != "Player")) {
                        let o = gameObjClasses[objData.constructorName].createFromDict(objData);
                        hex.loadObject(o);
                        o.hex = hex;
                    }
                }
            }
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
    var mapString = "var mapData = " + map.stringify(true, false)

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
class Test {}