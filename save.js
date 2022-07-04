

var saveGameAtEndThisFrameFlag = false;
var loadGameAtEndThisFrameFlag = false;
var saveFile;
var loadFile;

function saveGame(file = "save") {
    saveGameAtEndThisFrameFlag = true;
    saveFile = file;
}

function actuallySaveGame() {
    saveGameAtEndThisFrameFlag = false;
    localStorage.setItem(saveFile, map.stringify(true));
}

function loadGame(file = "save") {
    loadGameAtEndThisFrameFlag = true;
    loadFile = file;
}

function actuallyLoadGame() {
    loadGameAtEndThisFrameFlag = false;
    let gameSave = localStorage.getItem(loadFile);
    if (gameSave == null) return;
    map.data = Map.createMapDataFromString(gameSave);
    
}
