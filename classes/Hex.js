// < > |
class Hex {
  constructor(q, r, type="background") {
    this.q = q;
    this.r = r;
    this.x = Map.fromHexPosX(q, r)
    this.y = Map.fromHexPosY(q, r)
    this.setType(type)
    this.objects = new Set([]);
  }
  drawFloor() {
    if (!this.solid) {
      drawSprite(this.sprite, this.x - Hex.size - 0.5, this.y - Hex.yRenderSize, 2 * Hex.size + 1, 2 * Hex.yRenderSize, this.spriteFrame)
    }
  }
  drawOther() {
    if (this.solid) {
      drawSprite(this.sprite, this.x - Hex.size - 0.5, this.y - Hex.yRenderSize, 2 * Hex.size + 1, 2 * Hex.yRenderSize, this.spriteFrame)
    }
    for (let o of this.objects) {
      o.draw();
    }
    let x = this.x - player.viewX0;
    let y = this.y - player.viewY0;
    ctx.strokeStyle = "grey";
    ctx.lineWidth = 0.1;
    ctx.beginPath();
    let yOff = 0.5 * Hex.size * Hex.yxRatio
    ctx.moveTo(x + Hex.size, y - yOff);
    ctx.lineTo(x + Hex.size, y + yOff);
    ctx.lineTo(x, y + Hex.yxRatio * Hex.size);
    ctx.lineTo(x - Hex.size, y + yOff);
    ctx.lineTo(x - Hex.size, y - yOff);
    ctx.lineTo(x, y - Hex.yxRatio * Hex.size);
    ctx.closePath();
    ctx.stroke();
  }

  loadObject(o) {
    this.objects.add(o)
  }
  deloadObject(o) {
    this.objects.delete(o)
  }
  
  setType(type) {
    this.type = type
    this.solid = this.type in Hex.solidHexTypes
    if (this.type == "wall") {
      this.sprite = "wall";
      this.spriteFrame = 0
    }
    else if (this.type == "background") {
      this.sprite = "floor";
      this.spriteFrame = Math.floor(Math.random() * 2 + 4);
    }
  }

  static yxRatio = 2 / Math.sqrt(3);
  static size = 32;
  static yRenderSize = Math.round(Hex.size * Hex.yxRatio);
  static solidHexTypes = {
    "wall": true
  }
}