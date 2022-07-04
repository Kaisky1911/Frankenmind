// < > |

var effects = new Set([])

class Effect {
  constructor(x, y, maxTime) {
    this.x = x;
    this.y = y;
    this.time = 0;
    this.maxTime = maxTime
    effects.add(this);
  }

  draw(dur) {
    this.time += dur;
    if (this.time >= this.maxTime) effects.delete(this);
  }
}


class EffectNumberPop extends Effect {
  constructor(x, y, text, color, size, maxTime = 0.5) {
    super(x, y, maxTime);
    this.text = text;
    this.color = color;
    this.fillStyle = `rgb(${255 * color[0]}, ${255 * color[1]}, ${255 * color[2]})`;
    this.size = size;
    this.font = size + "px pixelfont";
  }
  
  draw(dur) {
    super.draw(dur);
    ctxTop.font = this.font;

    ctxTop.textAlign = "center"
    ctxTop.fillStyle = "black"
    ctxTop.fillText(this.text, this.x - player.viewX0-this.size / 10, this.y - player.viewY0+this.size / 10)
    ctxTop.fillText(this.text, this.x - player.viewX0-this.size / 10, this.y - player.viewY0)
    ctxTop.fillText(this.text, this.x - player.viewX0, this.y - player.viewY0+this.size / 10)
    ctxTop.fillStyle = this.fillStyle;
    ctxTop.fillText(this.text, this.x - player.viewX0, this.y - player.viewY0)
    this.y -= dur * 50;
  }
}

class EffectWallDamage extends Effect {
  constructor(x, y, count) {
    super(x, y, 1.0);
    this.particles = []
    for (let i = 0; i < count; ++i) {
      this.particles.push(
        {
          "x": this.x,
          "y": this.y,
          "vx": randMinPlus(100),
          "vy": randMinPlus(100),
          "frame": Math.floor(4 * Math.random()),
        });
    }
  }

  draw(dur) {
    super.draw(dur);
    for (let p of this.particles) {
      p.x += p.vx * dur;
      p.y += p.vy * dur;
      p.vy += 200 * dur;
      drawSprite(
        "wallParticle",
        p.x - EffectWallDamage.particleSize,
        p.y - EffectWallDamage.particleSize,
        2 * EffectWallDamage.particleSize,
        2 * EffectWallDamage.particleSize,
        p.frame
      )
    }
  }

  static particleSize = 3;
}


function doVisualEffect(effect) {
  effects.add(effect)
}

function randMinPlus(x) {
  return x * (2 * Math.random() - 1);
}
