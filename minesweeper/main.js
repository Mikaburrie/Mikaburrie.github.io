/* global use engine ImageHandeler Display Mouse Keyboard Tile NumberDisplay Face getWindowDimensions*/

var disp, game = {};
use("display", function(){
    disp = new Display(1, 1, "#c0c0c0");
    disp.canvasElement.style.visibility = "hidden";
    disp.canvasElement.setAttribute("id", "canvas");
    disp.setRenderStyle("pixelated");
    disp.canvas.imageSmoothingEnabled = false;
    disp.setStyle("borderRight", "2px solid #808080");
    disp.setStyle("borderBottom", "2px solid #808080");
});

use("imageHandeler", function(){
    ImageHandeler.setLoadingDir("res/img/");
    ImageHandeler.addGroup("tiles");
    ImageHandeler.addGroup("numbers");
    ImageHandeler.addGroup("faces");
    ImageHandeler.setOnload(init);
});

use("keyboard");
use("mouse", function(){
    Mouse.stopRight();
});

engine.onload = load;

function load(){
    ImageHandeler.addImage("tiles", "blank", "tiles.png", 0, 32 * 0, 32, 32);
    ImageHandeler.addImage("tiles", "flag", "tiles.png", 0, 32 * 1, 32, 32);
    ImageHandeler.addImage("tiles", "unknown", "tiles.png", 0, 32 * 2, 32, 32);
    ImageHandeler.addImage("tiles", "bombExploded", "tiles.png", 0, 32 * 3, 32, 32);
    ImageHandeler.addImage("tiles", "bombFalse", "tiles.png", 0, 32 * 4, 32, 32);
    ImageHandeler.addImage("tiles", "bomb", "tiles.png", 0, 32 * 5, 32, 32);
    ImageHandeler.addImage("tiles", "unknown2", "tiles.png", 0, 32 * 6, 32, 32);
    ImageHandeler.addImage("tiles", "8", "tiles.png", 0, 32 * 7, 32, 32);
    ImageHandeler.addImage("tiles", "7", "tiles.png", 0, 32 * 8, 32, 32);
    ImageHandeler.addImage("tiles", "6", "tiles.png", 0, 32 * 9, 32, 32);
    ImageHandeler.addImage("tiles", "5", "tiles.png", 0, 32 * 10, 32, 32);
    ImageHandeler.addImage("tiles", "4", "tiles.png", 0, 32 * 11, 32, 32);
    ImageHandeler.addImage("tiles", "3", "tiles.png", 0, 32 * 12, 32, 32);
    ImageHandeler.addImage("tiles", "2", "tiles.png", 0, 32 * 13, 32, 32);
    ImageHandeler.addImage("tiles", "1", "tiles.png", 0, 32 * 14, 32, 32);
    ImageHandeler.addImage("tiles", "0", "tiles.png", 0, 32 * 15, 32, 32);
    ImageHandeler.addImage("tiles", "selector", "selector.png", 0, 0, 32, 32);

    ImageHandeler.addImage("numbers", "-", "numbers.png", 0, 23 * 0, 13, 23);
    ImageHandeler.addImage("numbers", "blank", "numbers.png", 0, 23 * 1, 13, 23);
    ImageHandeler.addImage("numbers", "9", "numbers.png", 0, 23 * 2, 13, 23);
    ImageHandeler.addImage("numbers", "8", "numbers.png", 0, 23 * 3, 13, 23);
    ImageHandeler.addImage("numbers", "7", "numbers.png", 0, 23 * 4, 13, 23);
    ImageHandeler.addImage("numbers", "6", "numbers.png", 0, 23 * 5, 13, 23);
    ImageHandeler.addImage("numbers", "5", "numbers.png", 0, 23 * 6, 13, 23);
    ImageHandeler.addImage("numbers", "4", "numbers.png", 0, 23 * 7, 13, 23);
    ImageHandeler.addImage("numbers", "3", "numbers.png", 0, 23 * 8, 13, 23);
    ImageHandeler.addImage("numbers", "2", "numbers.png", 0, 23 * 9, 13, 23);
    ImageHandeler.addImage("numbers", "1", "numbers.png", 0, 23 * 10, 13, 23);
    ImageHandeler.addImage("numbers", "0", "numbers.png", 0, 23 * 11, 13, 23);

    ImageHandeler.addImage("faces", "alivePressed", "faces.png", 0, 24 * 0, 24, 24);
    ImageHandeler.addImage("faces", "win", "faces.png", 0, 24 * 1, 24, 24);
    ImageHandeler.addImage("faces", "lose", "faces.png", 0, 24 * 2, 24, 24);
    ImageHandeler.addImage("faces", "worry", "faces.png", 0, 24 * 3, 24, 24);
    ImageHandeler.addImage("faces", "alive", "faces.png", 0, 24 * 4, 24, 24);

    ImageHandeler.setDrawSurface(disp.canvas);

    Mouse.init();
    Keyboard.init();
    getWindowDimensions();
}

function init(){
    game = {};
    game.over = false;
    game.bombsMarked = 0;
    game.tilesMarked = 0;

    game.grid = [];
    game.grid.clickPos = {x:0, y:0};
    game.grid.keyboardPos = {x:0, y:0, hidden:true, keydown:false};
    game.grid.tileSize = 32;
    game.grid.tileOffset = 64;

    game.grid.width = Math.floor(window.width/game.grid.tileSize) - 1;
    game.grid.height = Math.floor((window.height - game.grid.tileOffset)/game.grid.tileSize) - 1;
    game.grid.bombs = Math.round((game.grid.width * game.grid.height)/8);

    disp.resize(game.grid.width * game.grid.tileSize, game.grid.height * game.grid.tileSize + game.grid.tileOffset);
    disp.canvasElement.style.visibility = "";

    for(var x = 0; x < game.grid.width; x++){
        game.grid[x] = [];
        for(var y = 0; y < game.grid.height; y++){
            game.grid[x][y] = new Tile(x, y);
        }
    }

    //creates the timer
    game.timer = new NumberDisplay(disp.width - 26 * 3 - 9, 9, 3, 0);
    game.timer.stop = function(){clearInterval(this.interval)};

    //creates bomb counter
    game.bombCounter = new NumberDisplay(9, 9, 3, game.grid.bombs);

    //creates face
    game.face = new Face(disp.width/2 - 24, 8, "alive");

    render();

    addEvents();
}

function addEvents(){
    Mouse.removeAllEvents();
    Keyboard.removeAllEvents();
    Mouse.addEvent("onclick", onFirstAction);
    Mouse.addEvent("onclick", onClick);
    Mouse.addEvent("onrclick", onRClick);
    Mouse.addEvent("ondown", function(){game.face.setStatus("worry");});
    Mouse.addEvent("onup", function(){game.face.setStatus("alive");});
    Keyboard.addEvent("arrowLeft", function(){moveSelector(-1, 0);});
    Keyboard.addEvent("arrowUp", function(){moveSelector(0, -1);});
    Keyboard.addEvent("arrowRight", function(){moveSelector(1, 0);});
    Keyboard.addEvent("arrowDown", function(){moveSelector(0, 1);});
    Keyboard.addEvent("space", onFirstAction);
    Keyboard.addEvent("space", onSpacePress);
    Keyboard.addEvent("space", function(){if(Keyboard.down){game.face.setStatus("worry");}});
    Keyboard.addEvent("shift", onShiftPress);
}

function moveSelector(x, y){
    if(Keyboard.down){
        game.grid.keyboardPos.hidden = false;
        unrenderSelector();
        if(game.grid.keyboardPos.x + x >= 0 && game.grid.keyboardPos.x + x < game.grid.width){
            game.grid.keyboardPos.x += x;
        }
        if(game.grid.keyboardPos.y + y >= 0 && game.grid.keyboardPos.y + y < game.grid.height){
            game.grid.keyboardPos.y += y;
        }
        renderSelector();
    }
}

function onSpacePress(){
    if(!Keyboard.down){
        game.face.setStatus("alive");
        setClickToSelector();
        processClick();
        render();
    }
}

function onShiftPress(){
    if(!Keyboard.down){
        setClickToSelector();
        processRClick();
        checkGameComplete();
        render();
    }
}

function hideSelector(){
    game.grid.keyboardPos.hidden = true;
    unrenderSelector();
}

function unrenderSelector(){
    game.grid[game.grid.keyboardPos.x][game.grid.keyboardPos.y].render();
}

function renderSelector(){
    if(!game.grid.keyboardPos.hidden){
        ImageHandeler.drawImage("tiles", "selector", game.grid.keyboardPos.x * game.grid.tileSize,
                             game.grid.keyboardPos.y * game.grid.tileSize + game.grid.tileOffset, game.grid.tileSize, game.grid.tileSize);
    }else{
        unrenderSelector();
    }
}

function onFirstAction(){
    if(!Mouse.click){
        setClickToSelector();
    }else{
        findMouseClick(game.grid.clickPos.x, game.grid.clickPos.y);
    }

    if(!Keyboard.down || clickOnScreen()){
        Mouse.removeEvent("onclick", onFirstAction);
        Keyboard.removeEvent("space", onFirstAction);
        genMap(game.grid.clickPos.x, game.grid.clickPos.y);

        //start timer
        game.timer.interval = setInterval(function(){
            game.timer.setValue(game.timer.val + 1);
            game.timer.render();
        }, 1000);
    }
}

function genMap(startX, startY){
    for(var i = 0; i < game.grid.bombs; i++){
        var x = Math.randInt(0, game.grid.width - 1), y = Math.randInt(0, game.grid.height - 1);
        if(game.grid[x][y].type == "bomb" || (Math.abs(startX - x) <= 1 && Math.abs(startY - y) <= 1)){
            i--;
        }else{
            game.grid[x][y].type = "bomb";
            game.grid[x][y].img = "bomb";
        }
    }

    for(x = 0; x < game.grid.width; x++){
        for(y in game.grid[x]){
            game.grid[x][y].calcType();
        }
    }
}

function findMouseClick(){
    disp.getPosition();
    game.grid.clickPos.x = Math.floor((Mouse.pageX - disp.pageX)/game.grid.tileSize);
    game.grid.clickPos.y = Math.floor((Mouse.pageY - disp.pageY - game.grid.tileOffset)/game.grid.tileSize);
    hideSelector();
}

function setClickToSelector(){
    game.grid.clickPos.x = game.grid.keyboardPos.x;
    game.grid.clickPos.y = game.grid.keyboardPos.y;
}

function clickOnScreen(){
    return (game.grid.clickPos.x >= 0 && game.grid.clickPos.x < game.grid.width &&
            game.grid.clickPos.y >= 0 && game.grid.clickPos.y < game.grid.height);
}

function processClick(){
    if(clickOnScreen()){
        game.grid[game.grid.clickPos.x][game.grid.clickPos.y].update();
    }
}

function processRClick(){
    if(clickOnScreen()){
        game.grid[game.grid.clickPos.x][game.grid.clickPos.y].mark();
    }
}

function checkGameComplete(){
    if(game.bombsMarked == game.grid.bombs && game.tilesMarked == game.grid.bombs){
        win();
    }
    game.bombCounter.setValue(game.grid.bombs - game.tilesMarked);
}

function onClick(){
    findMouseClick();
    processClick();
    render();
}

function onRClick(){
    findMouseClick();
    processRClick();
    checkGameComplete();
    render();
}

function stopGame(){
    Mouse.removeAllEvents();
    Keyboard.removeAllEvents();
    game.timer.stop();
    game.grid.keyboardPos.hidden = true;

    for(var x = 0; x < game.grid.width; x++){
        for(var y in game.grid[x]){
            game.grid[x][y].update(true, true);
        }
    }
}

function lose(){
    game.over = true;
    stopGame();
    game.face.setStatus("lose");
    setTimeout(init, 3000);
}

function win(){
    stopGame();
    game.face.setStatus("win");
}

function render(){
    for(var x = 0; x < game.grid.width; x++){
        for(var y in game.grid[x]){
            game.grid[x][y].render();
        }
    }

    renderSelector();

    game.timer.render();
    game.bombCounter.render();
    game.face.render();
}
