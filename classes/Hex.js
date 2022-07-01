// < > |
class Hex {
  constructor(q, r, data, type="wall") {
    this.q = q;
    this.r = r;
    this.x = Map.fromHexPosX(q, r)
    this.y = Map.fromHexPosY(q, r)
    this.objects = new Set([]);
    this.neighboors = [null, null, null, null, null]
    Map.connectNeighboorhood(data, this, q, r);
    this.setType(type)
  }
  draw(dur) {
    let context = ctx;
    if (!this.solid) {
      context = ctxBack
    }
    for (let frame of this.spriteFrames) {
      drawSprite(this.sprite, this.x - Hex.size, this.y - Hex.yRenderSize, 2 * Hex.size, 2 * Hex.yRenderSize, frame, 0, context)
    }
    for (let o of this.objects) {
      o.draw(dur);
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
      if (speed > 1000) {
        let dmg = Math.floor(speed / 1000)
        doVisualEffect(new EffectWallDamage(x, y, Math.floor(speed / 50)));
        this.spriteFrames[0] = Math.min(3, this.spriteFrames[0] + dmg);
        if (this.spriteFrames[0] == 3) {
          this.solid = false;
          doVisualEffect(new EffectWallDamage(this.x, this.y, 20));
          let sound = "wall_break_" + Math.floor(1 + Math.random() * 2)
          playSound(sound, this.x, this.y, Math.min(speed / 3000, 1.0));
        }
        else {
          let sound = "wall_hit_" + Math.floor(1 + Math.random() * 2)
          playSound(sound, this.x, this.y, Math.min(speed / 3000, 1.0));
        }
      }
    } else {
      playSound("wall_bump", this.x, this.y, Math.min(speed / 3000, 1.0));
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
      this.spriteFrames = [0]
      this.solid = true;
    }
    else if (this.type == "wallDestroyable") {
      this.sprite = "wallDestroyable";
      this.spriteFrames = [0];
      this.solid = true;
    }
    else if (this.type == "floor") {
      this.sprite = "floor";
      this.spriteFrames = [Math.floor(Math.random() * 2 + 4)];
      this.solid = false;
    }
    else if (this.type == "pit") {
      this.sprite = "pit";
      this.spriteFrames = [];
      let i = 0;
      for (let nb of this.neighboors) {
        if (nb == null || !nb.isPit) this.spriteFrames.push(i);
        else {
          let j = (i + 3) % 6
          let index = nb.spriteFrames.indexOf(j)
          if (index != -1) {
            nb.spriteFrames.splice(index, 1)
          }
        }
        i += 1;
      }
      this.spriteFrames = this.spriteFrames.reverse();
      this.solid = false;
      this.isPit = true;
    }
  }

  toggleFrames() {
    if (this.spriteFrames.length != 0) this.spriteFrames[0] = (this.spriteFrames[0] + 1) % sprites[this.sprite].frames
  }

  static yxRatio = 2 / Math.sqrt(3);
  static size = 48;
  static yRenderSize = Math.round(Hex.size * Hex.yxRatio);
}