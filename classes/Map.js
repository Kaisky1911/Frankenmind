// < > |
// Hex Grid Map
class Map {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.data = {};
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
        if (hex.solid) {
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
  doBounceCollision(o) {
      let hexs = this.getHexNeighboorHood(Map.toHexPosQ(o.x, o.y), Map.toHexPosR(o.x, o.y))
      for (let hex of hexs) {
        if (hex.solid) {
          let dx = o.x - hex.x;
          let dy = o.y - hex.y;
          let disSq = dx*dx + dy*dy;
          let minDis = o.constructor.size + Hex.size;
          if (disSq < minDis*minDis) { // overlap
            let angle = Math.atan2(dy, dx);
            let cos = Math.cos(angle)
            let sin = Math.sin(angle)
            let dotProduct = cos*o.vx + sin*o.vy
            if (dotProduct < 0) { // checks if the obj is actually moving towards the hex (dot product)
              o.vx -= 2 * dotProduct * cos;
              o.vy -= 2 * dotProduct * sin;
              doVisualEffect(EffectBallBounce, o.x, o.y);
              playSound("ballHitWall", o.x, o.y, 1.0);
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