
var soundNames = [
  "slowmow0",
  "slowmow1",
  "ballHitWall",
  "ballShoot",
  "bat_flap_2",
]
var soundNamesMP3 = [
  "collect_brain",
  "throw_brain",
  "wall_break_1",
  "wall_break_2",
  "wall_bump",
  "wall_hit_1",
  "wall_hit_2",
  "bat_attack",
  "bat_death",
  "bat_flap",
]
var sounds = {}
var oosspsd = 0 // outOfScreenStillPlaySoundDis
var soundMaxDis = 0
var soundCount = 10
var music = {};
var currentMusic = "default";
var walkSound;

var slowModeOscillator;
var slowModeOscillatorVolume;

const AudioContext = window.AudioContext || window.webkitAudioContext
audioContext = null
stereo = null

function updateMusic(name) {
  if (name != currentMusic) {
    if (music[currentMusic].paused) {
      currentMusic = name;
    }
    else {
      music[currentMusic].pause();
      music[currentMusic].currentTime = 0;
      currentMusic = name;
      music[currentMusic].play();
    }
  }
}

function setSlowModeSound(volume, freq) {
  slowModeOscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
  slowModeOscillatorVolume.gain.value = volume;
}

function initAudio() {
  audioContext = new AudioContext()
  stereo = new StereoPannerNode(audioContext, { pan: 0 })
	updateStereoVariables()

  music["default"] = new Audio('sounds/Dungeon_Theme_r2.mp3');
  music["default"].loop = true;
  music["default"].volume = 0.2;

  music["battle"] = new Audio('sounds/Battle_Theme_1.mp3');
  music["battle"].loop = true;
  music["battle"].volume = 0.2;

  music[currentMusic].play();

  walkSound = new Audio('sounds/walking_3.mp3');
  walkSound.volume = 0.3;
  walkSound.loop = true;

  slowModeOscillatorVolume = audioContext.createGain();
  slowModeOscillator = audioContext.createOscillator();
  slowModeOscillator.type = "sine";
  setSlowModeSound(0, 400)
  slowModeOscillator.connect(slowModeOscillatorVolume)
  slowModeOscillatorVolume.connect(audioContext.destination)
  slowModeOscillator.start();

  for (let sound of soundNames) {
    sounds[sound] = [0]
    for (i = 0; i < soundCount; ++i) {
      sounds[sound].push(new Audio(`sounds/${sound}.wav`))
      audioContext.createMediaElementSource(sounds[sound][i+1]).connect(stereo).connect(audioContext.destination);
    }
  }

  for (let sound of soundNamesMP3) {
    sounds[sound] = [0]
    for (i = 0; i < soundCount; ++i) {
      sounds[sound].push(new Audio(`sounds/${sound}.mp3`))
      audioContext.createMediaElementSource(sounds[sound][i+1]).connect(stereo).connect(audioContext.destination);
    }
  }
}

function updateStereoVariables() {
    oosspsd = Math.max(canvas.width, canvas.height) / 8
    maxXdis = canvas.width / 2 + oosspsd
    maxYdis = canvas.height / 2 + oosspsd
    soundMaxDis = maxXdis * maxXdis + maxYdis * maxYdis
}

function playSound(sound, game_x, game_y, volume) {
  let x = game_x - player.viewX0;
  let y = game_y - player.viewY0;
  let disX = x - canvas.width / 2;
  let disY = y - canvas.height / 2;
  let dis = disX * disX + disY * disY
  if (-oosspsd < x && x < canvas.width + oosspsd && -oosspsd < y && y < canvas.height + oosspsd) {
    let soundObj = sounds[sound][sounds[sound][0] + 1]
    sounds[sound][0] = (sounds[sound][0] + 1) % soundCount
    stereo.pan.value = 2 * (x + oosspsd) / (canvas.width + 2 * oosspsd) - 1
    soundObj.volume = volume * Math.max(0, 1.0 - 2 * dis / soundMaxDis)
    soundObj.play()
  }
}
