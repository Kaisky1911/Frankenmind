

var saveGameAtEndThisFrameFlag = false;

function saveGame() {
    saveGameAtEndThisFrameFlag = true;
}

function actuallySaveGame() {
    saveGameAtEndThisFrameFlag = false;
    localStorage.setItem('gameSave', map.stringify(true));
}

function loadGame() {
    let gameSave = localStorage.getItem('gameSave');
    if (gameSave == null) return;
    map.data = Map.createMapDataFromString(gameSave);
}
