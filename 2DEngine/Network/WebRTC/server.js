var Server = require("./../Socket/server.js");


var RTC = {
    idCharacters: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    idList: {},
    idLength: 4
};

RTC.init = function(){
    Server.init();
};

RTC.generateId = function(len){
    var id = "";
    for(var i = 0; i < len; i++){
        id += this.idCharacters[Math.floor(Math.random() * this.idCharacters.length)];
    }
    
    if(this.idList[id]){
        return this.generateId(len + 1);
    }
    return id;
};

Server.onconnect = function(connection){
    var id = RTC.generateId(RTC.idLength);
    connection.name = id;
    RTC.idList[id] = connection;
    this.sendTo(connection.id, JSON.stringify(["server", "id", id]));
};

Server.onmessage = function(connection, message){
    message = JSON.parse(message);
    var id = RTC.idList[message[0]];
    message[0] = connection.name;
    message = JSON.stringify(message);
    if(id){
        this.sendTo(id.id, message);
    }else{
        this.sendTo(connection.id, JSON.stringify(["server", "error", "nouser"]));
    }
};

Server.onclose = function(connection){
    delete RTC.idList[connection.name];
};

module.exports = RTC;