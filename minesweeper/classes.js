/* global game ImageHandeler lose*/
function Tile(x, y){
    this.x = x;
    this.y = y;
    this.img = "blank";
    this.type = "blank";
    this.marked = false;
    this.revealed = false;
    this.nearbyBombs = 0;
    this.markedBombs = 0;
}

Tile.prototype.getSurrounding = function(){
    this.neighbors = [];
    for(var x = Math.max(this.x - 1, 0); x <= Math.min(this.x + 1, game.grid.width - 1); x++){
        for(var y = Math.max(this.y - 1, 0); y <= Math.min(this.y + 1, game.grid.height - 1); y++){
            if(x != this.x || y != this.y){
                this.neighbors.push(game.grid[x][y]);
            }
        }
    }
    return this.neighbors;
};

Tile.prototype.getBombNeighbors = function(){
    this.getSurrounding();
    this.nearbyBombs = 0;
    this.markedBombs = 0;
    for(var i in this.neighbors){
        if(this.neighbors[i].type == "bomb"){
            this.nearbyBombs++;
        }
        if(this.neighbors[i].marked){
            this.markedBombs++;
        }
    }
};

Tile.prototype.calcType = function(){
    if(this.type != "bomb"){
        this.getBombNeighbors();
        this.type = this.nearbyBombs.toString();
    }
};

Tile.prototype.reveal = function(notClicked, gameOver){
    this.revealed = true;
    if(this.type == "bomb"){
        this.img = "bomb";
        if(!game.over){
            this.img = "bombExploded";
            lose();
        }
    }else{
        this.img = this.type;
        if(this.type == "0" && !gameOver){
            this.revealNeighbors();
        }
        
        if(this.marked && gameOver){
            this.mark();
            this.img = "bombFalse";
        }
    }
};

Tile.prototype.revealNeighbors = function(){
    for(var i in this.neighbors){
        this.neighbors[i].update(true);
    }
};

Tile.prototype.update = function(notClicked, gameOver){
    if(!this.marked){
        if(!this.revealed){
            this.reveal(notClicked);
        }else if(!notClicked && this.type != "0"){
            this.getBombNeighbors();
            if(this.nearbyBombs == this.markedBombs){
                this.revealNeighbors();
            }
        }
    }else if(this.type != "bomb" && gameOver){
        this.reveal(notClicked, gameOver);
    }
};

Tile.prototype.mark = function(){
    if(!this.revealed){
        this.marked = !this.marked;
        game.tilesMarked += (this.marked ? 1 : -1);
        if(this.type == "bomb"){
            game.bombsMarked += (this.marked ? 1 : -1);
        }
    }
};

Tile.prototype.render = function(){
    ImageHandeler.drawImage("tiles", this.revealed ? this.img : (this.marked ? "flag" : "blank"),this.x * game.grid.tileSize,
                            this.y * game.grid.tileSize + game.grid.tileOffset, game.grid.tileSize, game.grid.tileSize);
};



function NumberDisplay(x, y, digits, startVal){
    this.x = x;
    this.y = y;
    this.singleWidth = 26;
    this.width = digits * this.singleWidth;
    this.height = 46;
    this.digits = digits;
    this.setValue(startVal);
}

NumberDisplay.prototype.setValue = function(val){
    this.val = val;
    this.valArray = val.toString();
};

NumberDisplay.prototype.render = function(){
    var digits = this.digits;
    for(var i = this.valArray.length - 1; i >= this.valArray.length - this.digits; i--){
        digits--;
        ImageHandeler.drawImage("numbers", this.valArray[i] == undefined ? "blank" : this.valArray[i],
                                this.x + this.singleWidth * digits, this.y, this.singleWidth, this.height);
    }
};



function Face(x, y, status){
    this.x = x;
    this.y = y;
    this.width = 48;
    this.height = 48;
    this.status = status;
}

Face.prototype.setStatus = function(status){
    this.status = status;
    this.render();
};

Face.prototype.render = function(){
    ImageHandeler.drawImage("faces", this.status, this.x, this.y, this.width, this.height);
};