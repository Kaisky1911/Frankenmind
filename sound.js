
var soundNames = [
  "slowmow0",
  "slowmow1",
  "ballHitWall",
  "ballShoot",
  "bat_flap_2",
  "Player_Speech_0",
  "Player_Speech_1",
  "Player_Speech_2",
  "Player_Speech_3",
  "Player_Speech_4",
  "Player_Speech_5",
  "Player_Speech_6",
  "Player_Speech_7",
  "Player_Speech_9",
  "Player_Speech_10",
  "Player_Speech_11",
  "Player_Speech_12",
  "Player__NewLines_1",
  "Player__NewLines_2",
  "Player__NewLines_3",
  "Player__NewLines_4",
  "Player__NewLines_5",
  "Player__NewLines_6",
  "Player__NewLines_7",
  "Player__NewLines_8",
  "Player__NewLines_9",
  "Player__NewLines_10",
  "Player__NewLines_11",
  "Player__NewLines_12",
  "Player__NewLines_13",
  "Player__NewLines_14",
  "Player__NewLines_15",
  "Player__NewLines_16",
  "Player__NewLines_17",
  "Player__NewLines_18",
  "Player__NewLines_19",
  "Player__NewLines_20",
  "Player__NewLines_21",
  "Player__NewLines_22",
  "Player__NewLines_23",
  "Player__NewLines_24",
  "Player__NewLines_25",
  "Player__NewLines_26",
  "Player__NewLines_27",
  "Player__NewLines_28",
  "Player__NewLines_29",
  "Player__NewLines_30",
  "lizard_death",
]
var soundNamesMP3 = [
  "heart",
  "throw_brain",
  "wall_break_1",
  "wall_break_2",
  "wall_bump",
  "wall_hit_1",
  "wall_hit_2",
  "enemy_death",
  "bat_attack",
  "bat_flap",
  "rat_attack",
  "rat_move",
  "snake_attack",
  "brain_fall",
  "wall_move",
  "wall_fall",
  "door_open",
  "lizard_spin",
  "lizard_growl",
  "lizard_roar",
  "lizard_throw",
  "lizard_walk",
  "lever",
  "boulder",
]

var sounds = {}
var oosspsd = 0 // outOfScreenStillPlaySoundDis
var soundMaxDis = 0
var soundCount = 10
var music = {};
var currentMusic = "menu";
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

  music["win"] = new Audio('sounds/win_theme.mp3');
  music["win"].loop = true;
  music["win"].volume = 0.2;

  music["menu"] = new Audio('sounds/opening_theme.mp3');
  music["menu"].loop = true;
  music["menu"].volume = 0.2;

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
      sounds[sound][i+1].crossOrigin = "anonymous";
      audioContext.createMediaElementSource(sounds[sound][i+1]).connect(audioContext.destination);
    }
  }

  for (let sound of soundNamesMP3) {
    sounds[sound] = [0]
    for (i = 0; i < soundCount; ++i) {
      sounds[sound].push(new Audio(`sounds/${sound}.mp3`))
      sounds[sound][i+1].crossOrigin = "anonymous";
      audioContext.createMediaElementSource(sounds[sound][i+1]).connect(audioContext.destination);
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
