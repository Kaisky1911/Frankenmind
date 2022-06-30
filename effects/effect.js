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
