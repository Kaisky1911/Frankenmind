

class GameObject {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.hex = map.hexAtXY(this.x, this.y);
    this.hex.loadObject(this);
    this.constructorName = this.constructor.name
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
    }
  }

}