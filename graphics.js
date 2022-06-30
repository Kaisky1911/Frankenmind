// < > |


var sprites = {
  "player": {
    "w": 20,
    "h": 24,
    "yOff": 4
  },
  "ball": {
    "w": 32,
    "h": 32,
  },
  "floor4": {
    "w": 32,
    "h": 37,
  },
  "floor": {
    "w": 32,
    "h": 37,
    "frames": 6,
  },
  "wall": {
    "w": 32,
    "h": 47,
    "yOff": 10,
  },
  "wallDestroyable": {
    "w": 32,
    "h": 47,
    "yOff": 10,
    "frames": 4,
  },
  "wallParticle": {
    "w": 4,
    "h": 4,
    "frames": 4,
  },
  "chain": {
    "w": 240,
    "h": 14,
    "frames": 1,
  },
  "pit": {
    "w": 32,
    "h": 37,
    "frames": 4,
  }
}


function initGraphics() {
  for (var [key, sprite] of Object.entries(sprites)) {
    img = new Image()
    img.src = `./sprites/${key}.png`
    sprite["img"] = img
    if (!("frames" in sprite)) sprite["frames"] = 1;
    if (!("yOff" in sprite)) sprite["yOff"] = 0;
  }
}

function drawSprite(spriteKey, x, y, w, h, frame = 0, angle = 0) {
  let sprite = sprites[spriteKey]
  let yOff = Math.round(sprite.yOff * h / (sprite.h - sprite.yOff))
  if (angle == 0) {
    ctx.drawImage(sprite.img, frame * sprite.w, 0, sprite.w, sprite.h, x - player.viewX0, y - player.viewY0 - yOff, w, h + yOff);
  }
  else {
    ctx.save();
    ctx.translate(x - player.viewX0 + w/2, y - player.viewY0 + h/2);
    ctx.rotate(angle);
    ctx.drawImage(
      sprite.img,
      frame * sprite.w, 0,
      sprite.w, sprite.h,
      -w/2, -h/2 - yOff,
      w, h + yOff
    );
    ctx.restore();
  }
}

function draw(dur) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  map.draw();
  for (let effect of effects) {
    effect.draw(dur);
  }
}
