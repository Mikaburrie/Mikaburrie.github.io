/* global */
var Server = require("./../Socket/server.js");

var Multi = {
    instance: "server",
    protocol: "",
    server: Server,
    netIndex:{},
    objects:[],
    removeObjects:[],
    players:[],
    removePlayers:[],
    connected:0,
    tick:0,
    updateRate:60,
    sendRate:20,
    lagCompensationTime:60
};

Multi.init = function(protocol){
    Server.init();
    this.protocol = protocol || "";
};

Multi.addObject = function(obj){
    for(var i = 0; i <= this.objects.length; i++){
        if(this.objects[i] == undefined){
            obj.id = i;
            this.objects[i] = obj;
            break;
        }
    }
};

Multi.removeObject = function(id){
    delete this.objects[id];
    this.removeObjects.push(id);
};

Multi.addPlayer = function(player){
    for(var i = 0; i <= this.players.length; i++){
        if(this.players[i] == undefined){
            player.id = i;
            this.players[i] = player;
            break;
        }
    }
};

Multi.removePlayer = function(id){
    delete this.players[id];
    this.removePlayers.push(id);
};

Multi._onconnect = function(id){
    var player = Multi.onconnect(id);
    player._player = new NetworkedPlayer(player);
    this.sendTo(id, "index", this.netIndex);
    this.sendTo(id, "id", player._netId);
    return player._player;
};

Multi.onconnect = function(id){
    return {id: id};
};

Multi.onmessage = function(id, type, message){
    switch(type){
        case "ping":
            Multi.sendTo(id, "ping", 0);
            this.players[id].latency = message;
        break;
        case "input":
            this.players[id].pushInput(message);
            this.players[id].inputProcessed = message._inNum;
        break;
        case "error":
            console.log("    " + message);
        break;
    }
};

Multi.update = function(){
    if(this.tick % (this.updateRate/this.sendRate) < 1){
        this.sendUpdate();
    }
    
    for(var i in this.players){
        this.players[i].net.savePosition(this.tick);
    }
    
    this.tick++;
};

Multi.sendUpdate = function(){
    var data = [];
    for(var i = 0; i < this.objects.length; i++){
        if(this.objects[i] !== undefined){
            data[i] = this.objects[i].getNetVarData();
        }
    }
    
    for(i in this.players){
        this.sendTo(Number(i), "update", [this.players[i].inputProcessed].concat(data));
    }
};

Multi.sendAll = function(type, data){
    Server.sendAll(JSON.stringify([type, this.tick, data]));
};

Multi.sendTo = function(id, type, data){
    Server.sendTo(id, JSON.stringify([type, this.tick, data]));
};

Multi.targetClass = function(target){
    this.target = target.prototype.constructor.name;
    this.netIndex[this.target] = {predict: false, compensate: false, vars: [], params:[]};
};

Multi.setPredictable = function(predict){
    this.netIndex[this.target].predict = (predict == undefined ? true : predict);
};

Multi.setCompensatable = function(compensate){
    this.netIndex[this.target].compensate = (compensate == undefined ? true : compensate);
};

Multi.defineVar = function(type, name, interp, decimalLimit, predictWeight){
    var netData = {type: type, name: name, predict: predictWeight || 0};
    if(interp){
        netData.interp = true;
    }
    
    if(decimalLimit != undefined){
        netData.limit = decimalLimit;
    }
    
    this.netIndex[this.target].vars.push(netData);
};

Multi.defineConstructor = function(params){
    var index = this.netIndex[this.target];
    for(var i in params){
        for(var j in index.vars){
            if(index.vars[j].name == params[i]){
                params[i] = Number(j);
                break;
            }
        }
    }
    index.params = params;
};



Server.onconnect = function(connection){
    Multi.players[connection.id] = Multi._onconnect(connection.id);
    Multi.connected++;
};

Server.onmessage = function(connection, message){
    message = JSON.parse(message);
    Multi.onmessage(connection.id, message[0], message[1]);
};

Server.onclose = function(connection){
    Multi.players[connection.id].destroy();
};



function NetworkedObject(obj){
    this.object = obj;
    this.objectType = obj.constructor.name;
    this.del = 0;
    this.positionHistory = [];
    Multi.addObject(this);
    this.object._netId = this.id;
}

NetworkedObject.prototype.getNetVarData = function(){
    var result = [this.objectType];
    for(var i in Multi.netIndex[this.objectType].vars){
        var index = Multi.netIndex[this.objectType].vars[i];
        if(index.limit != undefined){
            result.push(Number(this.object[index.name].toFixed(index.limit)));
        }else{
            result.push(this.object[index.name]);
        }
    }
    
    if(this.del){
        Multi.removeObject(this.id);
    }
    
    return result;
};

NetworkedObject.prototype.savePosition = function(){
    this.positionHistory.unshift({});
    
    var vars = Multi.netIndex[this.objectType].vars;
    for(var i in vars){
        this.positionHistory[0][vars[i].name] = this.object[vars[i].name];
    }
    
    while(this.positionHistory.length > Multi.lagCompensationTime){
        this.positionHistory.pop();
    }
};

NetworkedObject.prototype.applyPosition = function(tick){
    var index = Multi.tick - tick, vars = Multi.netIndex[this.objectType].vars;
    for(var i in vars){
        this.object[vars[i].name] = this.positionHistory[index][vars[i].name];
    }
};

NetworkedObject.prototype.destroy = function(){
    this.del = 1;
    this.object.del = 1;
};



function NetworkedPlayer(player){
    this.player = player;
    this.net = Multi.objects[this.player._netId];
    this.inputProcessed = 0;
    Multi.addPlayer(this);
}

NetworkedPlayer.prototype.pushInput = function(input){
    if(this.player.oninput == undefined){
        return;
    }
    
    if(input._comp !== undefined){
        for(var i in Multi.objects){
            if(Multi.netIndex[Multi.objects[i].objectType].compensate){
                Multi.objects[i].applyPosition(input._comp);
            }
        }
        for(i in Multi.players){
            if(Multi.netIndex[Multi.players[i].objectType].compensate && Multi.players[i].id !== this.id){
                Multi.players[i].net.applyPosition(input._comp);
            }
        }
    }
    
    this.player.oninput(input);
};

NetworkedPlayer.prototype.destroy = function(){
    Multi.removePlayer(this.id);
    if(this.net == undefined){
        return;
    }
    
    if(!this.net.del){
        this.net.destroy();
    }
};


module.exports = {Multi: Multi, NetworkedObject: NetworkedObject};