

class GameObject {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.hex = map.hexAtXY(this.x, this.y);
    this.hex.loadObject(this);
  }

  
  updateHex() {
    let hex = map.hexAtXY(this.x, this.y);
    if (hex != this.hex) {
      this.hex.deloadObject(this);
      this.hex = hex;
      this.hex.loadObject(this);
    }
  }
}