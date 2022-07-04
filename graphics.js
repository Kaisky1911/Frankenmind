// < > |


var sprites = {
  "title": {
    "w": 128,
    "h": 128,
  },
  "player": {
    "w": 19,
    "h": 26,
    "yOff": 4,
    "frames": 4,
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
    "frames": 5,
  },
  "wallDestroyable": {
    "w": 32,
    "h": 47,
    "yOff": 10,
    "frames": 4,
  },
  "wallMovable": {
    "w": 32,
    "h": 47,
    "yOff": 10,
    "frames": 1,
  },
  "wallMovableSunken": {
    "w": 32,
    "h": 47,
    "yOff": -10,
    "frames": 1,
  },
  "door": {
    "w": 32,
    "h": 37,
    "frames": 2,
  },
  "lava": {
    "w": 32,
    "h": 37,
    "frames": 2,
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
  },
  "bat": {
    "w": 19,
    "h": 13,
    "frames": 6,
  },
  "snake": {
    "w": 32,
    "h": 20,
    "frames": 4,
  },
  "rat": {
    "w": 17,
    "h": 29,
    "frames": 4,
  },
  "lizard": {
    "w": 48,
    "h": 66,
    "frames": 4,
  },
  "heart": {
    "w": 5,
    "h": 8,
    "frames": 2,
  },
  "heart2": {
    "w": 8,
    "h": 8,
  },
  "lever": {
    "w": 11,
    "h": 15,
    "frames": 2,
  },
  "fireball": {
    "w": 12,
    "h": 18,
    "frames": 3,
  },
  "boulder": {
    "w": 240,
    "h": 240,
  },
  "sign": {
    "w": 32,
    "h": 32,
  },
  "save": {
    "w": 32,
    "h": 32,
  },
  "end": {
    "w": 320,
    "h": 198,
  },
}


function initGraphics() {
  for (var [key, sprite] of Object.entries(sprites)) {
    img = new Image()
    img.src = `./sprites/${key}.png`
    sprite["img"] = img
    if (!("frames" in sprite)) sprite["frames"] = 1;
    if (!("dir" in sprite)) sprite["dir"] = 1;
    if (!("yOff" in sprite)) sprite["yOff"] = 0;
  }
}

function drawSprite(spriteKey, x, y, w, h, frame = 0, angle = 0, context = ctx, action = 0) {
  let sprite = sprites[spriteKey]
  let yOff = Math.round(sprite.yOff * h / (sprite.h - Math.abs(sprite.yOff)))
  let yOff2 = yOff;
  if (sprite.yOff < 0) yOff2 = 0;
  if (angle == 0) {
    context.drawImage(sprite.img, frame * sprite.w, action * sprite.h, sprite.w, sprite.h, x - player.viewX0, y - player.viewY0 - yOff2, w, h + Math.abs(yOff));
  }
  else {
    context.save();
    context.translate(x - player.viewX0 + w/2, y - player.viewY0 + h/2);
    context.rotate(angle);
    context.drawImage(
      sprite.img,
      frame * sprite.w, action * sprite.h,
      sprite.w, sprite.h,
      -w/2, -h/2 - yOff,
      w, h + yOff
    );
    context.restore();
  }
}

function drawShadow(x, y, size, context) {
  context.fillStyle = "black";
  context.beginPath();
  context.arc(x - player.viewX0, y - player.viewY0, size, 0, Math.PI * 2);
  context.closePath();
  context.fill();
}

function draw(dur) {
  ctxBack.clearRect(0, 0, canvasBack.width, canvasBack.height);
  ctxShadow.clearRect(0, 0, canvasShadow.width, canvasShadow.height);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctxTop.clearRect(0, 0, canvasTop.width, canvasTop.height);
  ctxTopShadow.clearRect(0, 0, canvasTopShadow.width, canvasTopShadow.height);
  map.draw(dur);
  for (let effect of effects) {
    effect.draw(dur);
  }

  for (var i = 0; i < player.maxHp; ++i) {
    let sx = 5 * (i%2)
    ctxTop.drawImage(sprites["heart"].img, sx, 0, 5, 8, (i+1) * heartW, heartW, heartW, heartH)
    if (i < player.hp) ctxTop.drawImage(sprites["heart"].img, 10 + sx, 0, 5, 8, (i+1) * heartW, heartW, heartW, heartH)
  }

  if (player.dead) {
    ctxTop.fillStyle = "rgba(0, 0, 0, " + 1.6 * Math.min(player.deadTimer, 0.5) + ")";
    ctxTop.fillRect(0, 0, canvasTop.width, canvasTop.height);
  }
}

const heartW = 25;
const heartH = 40;
