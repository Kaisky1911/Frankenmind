// < > |
class Hex {
  constructor(q, r, type="wall") {
    this.q = q;
    this.r = r;
    this.x = Map.fromHexPosX(q, r)
    this.y = Map.fromHexPosY(q, r)
    this.setType(type)
    this.objects = new Set([]);
  }
  drawFloor() {
    if (!this.solid) {
      if (this.type == "wallDestroyable") {
        drawSprite("floor", this.x - Hex.size - 0.5, this.y - Hex.yRenderSize, 2 * Hex.size + 1, 2 * Hex.yRenderSize, 0)
      }
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
    /*
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
    */
  }

  gotHit(x, y, speed) {
    if (this.type == "wallDestroyable") {
      if (speed > 500) {
        let dmg = Math.floor(speed / 500)
        doVisualEffect(new EffectWallDamage(x, y, Math.floor(speed / 50)));
        this.spriteFrame = Math.min(3, this.spriteFrame + dmg);
        if (this.spriteFrame == 3) {
          this.solid = false;
          doVisualEffect(new EffectWallDamage(x, y, 20));
          let sound = "wall_break_" + Math.floor(1 + Math.random() * 2)
          playSound(sound, this.x, this.y, Math.min(speed / 1000, 1.0));
        }
        else {
          let sound = "wall_hit_" + Math.floor(1 + Math.random() * 2)
          playSound(sound, this.x, this.y, Math.min(speed / 1000, 1.0));
        }
      }
    } else {
      playSound("wall_bump", this.x, this.y, Math.min(speed / 1000, 1.0));
    }
  }

  loadObject(o) {
    this.objects.add(o)
  }
  deloadObject(o) {
    this.objects.delete(o)
  }
  
  setType(type) {
    this.type = type
    this.isPit = false;
    if (this.type == "wall") {
      this.sprite = "wall";
      this.spriteFrame = 0
      this.solid = true;
    }
    else if (this.type == "wallDestroyable") {
      this.sprite = "wallDestroyable";
      this.spriteFrame = 0;
      this.solid = true;
    }
    else if (this.type == "floor") {
      this.sprite = "floor";
      this.spriteFrame = Math.floor(Math.random() * 2 + 4);
      this.solid = false;
    }
    else if (this.type == "pit") {
      this.sprite = "pit";
      this.spriteFrame = 0;
      this.solid = false;
      this.isPit = true;
    }
  }

  toggleFrames() {
    this.spriteFrame = (this.spriteFrame + 1) % sprites[this.sprite].frames
  }

  static yxRatio = 2 / Math.sqrt(3);
  static size = 48;
  static yRenderSize = Math.round(Hex.size * Hex.yxRatio);
}