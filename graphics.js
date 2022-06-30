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
  "wallParticle": {
    "w": 4,
    "h": 4,
    "frames": 4,
  },
  "chain": {
    "w": 240,
    "h": 14,
    "frames": 1,
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

function drawSprite(spriteKey, x, y, w, h, frame = 0) {
  let sprite = sprites[spriteKey]
  let yOff = Math.round(sprite.yOff * h / (sprite.h - sprite.yOff))
  ctx.drawImage(sprite.img, frame * sprite.w, 0, sprite.w, sprite.h, x - player.viewX0, y - player.viewY0 - yOff, w, h + yOff);
}

function draw(dur) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  map.draw();
  for (let effect of effects) {
    effect.draw(dur);
  }
}
