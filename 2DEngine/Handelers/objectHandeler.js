var Objects = {
    player:null,
    players:[],
    objects:[],
    handeler: true //used as identification to validate this is the object handeler
};

Objects.setPlayer = function(player){
    this.player = player;
};

Objects.getPlayer = function(){
    return this.player;
};

Objects.loopPlayers = function(callback){
    for(var i in this.players){
        callback(this.players[i], Number(i));
    }
};

Objects.loopObjects = function(callback){
    for(var i = 0; i < this.objects.length; i++){
        if(this.objects[i]){
            callback(this.objects[i], i);
        }
    }
};

Objects.loopAll = function(callback){
    this.loopPlayers(callback);
    this.loopObjects(callback);
};

Objects.addPlayer = function(player){
    player._objId = this.players.push(player) - 1;
};

Objects.addObject = function(object){
    //object._objId = this.objects.push(object) - 1;
    var added = false;
    for(var i = 0; i < this.objects.length; i++){
        if(!this.objects[i]){
            this.objects[i] = object;
            this.objects[i]._objId = i;
            added = true;
            break;
        }
    }
    
    if(!added){
        this.objects.push(object);
        object._objId = this.objects.length - 1;
    }
};

Objects.removePlayer = function(player){
    this.players.splice(player._objId, 1);
    for(var i in this.players){
        this.players._objId = Number(i);
    }
};

Objects.removeObject = function(object){
    /*this.objects.splice(object._objId, 1);
    for(var i in this.objects){
        this.objects._objId = Number(i);
        console.log(i);
    }*/
    delete this.objects[object._objId];
};

if(typeof module != "undefined"){
    module.exports = Objects;
}