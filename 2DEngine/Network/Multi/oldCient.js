/* global use Socket Objects */
use("socket");
use("objectHandeler");

var Multi = {
    objects:[],
    players:[],
    dataBuffer:[],
    clientId:null,
    tick:0,
    updateRate:60,
    sendRate:20,
    lastPingTime:0,
    latency:0,
    interpTime:0.1
};

Multi.init = function(url, protocol){
    this.socket = new Socket(url, protocol);
    this.socket.onmessage = function(e){Multi.onmessage(e, JSON.parse(e.data));};
};

Multi.open = function(){
    this.socket.init();
};

Multi.addObject = function(obj, id){
    this.objects[id] = obj;
};

Multi.update = function(){
    this.getBufferIndex();
    
    this.tick++;
};

Multi.getBufferIndex = function(){
    var frame = this.tick - (this.updateRate * this.interpTime); //target frame
    var index = Math.floor(this.sendRate * this.interpTime) + 1; //initial guess
    if(this.dataBuffer.length <= index){ //buffer is too small
        index = this.dataBuffer.length - 1; //choose next closest
        if(index == -1){ //nothing in buffer, do nothing
            this.tick++;
            return;
        }
    }
    
    while(this.dataBuffer[index].tick < frame){ //while too far behind
        index--; //shift forward
        if(index == -1){ //if current frame nonexistent, drop
            console.log("dropped"); //add extrapolation
            this.tick++;
            return;
        }
    }
    
    this.calcPosition(index, frame);
};

Multi.calcPosition = function(index, frame){
    var current = this.dataBuffer[index], prev = this.dataBuffer[index + 1];
    var interpFactor = current.tick - frame;
    if(prev == undefined){
        prev = {data:[]};
    }
    
    var state = [];
    
    for(var i = 0; i < current.data.length; i++){
        if(!!current.data[i] && !!prev.data[i]){
            state[i] = [];
            for(var j in current.data[i]){
                state[i][j] = current.data[i][j];
                if(typeof current.data[i][j] == "number"){
                    state[i][j] = this.interp(current.data[i][j], prev.data[i][j],
                                    interpFactor/(this.updateRate/this.sendRate));
                }
            }
        }else if(!current.data[i] && !!prev.data[i]){
            
        }else if(!!current.data[i] && !prev.data[i]){
            state[i] = current.data[i];
            if(!this.objects[current.data[i][1]] || current.data[i][2]){
                let obj = new window[current.data[0][0]]();
                obj._net = new NetworkedObject(obj, current.data[i][1]);
                Objects.addObject(obj);
            }
        }
    }
    
    this.applyState(state);
};

Multi.applyState = function(state){
    for(var i in state){
        for(var j in this.netIndex[state[i][0]]){
            this.objects[state[i][1]].object[this.netIndex[state[i][0]][j]] = state[i][Number(j) + 3];
        }
    }
};

Multi.interp = function(start, end, amt){
    return start + (end - start) * amt;
};

Multi.oncreateobject = function(obj){
    
};

Multi.onmessage = function(e, message){
    switch(message.type){
        case "ping":
            this.ping(e);
        break;
        case "update":
            this.dataBuffer.unshift(message);
            while(this.dataBuffer.length > (this.sendRate * this.interpTime) + 2){
                this.dataBuffer.pop();
            }
            this.tick = message.tick;
        break;
        case "info":
            this.clientId = message.data[0];
            this.tick = message.data[1];
            this.updateRate = message.data[2];
            this.sendRate = message.data[3];
            this.netIndex = message.data[4];
            this.lastPingTime = e.timeStamp;
        break;
        case "netindex":
            this.netIndex = message.data;
        break;
    }
};

Multi.ping = function(e){
    this.sendPing();
    this.latency = Math.round(e.timeStamp - this.lastPingTime);
    this.lastPingTime = e.timeStamp;
};

Multi.sendPing = function(){
    this.socket.send(JSON.stringify({type:"ping", data:[this.latency]}));
};



function NetworkedObject(obj, id){
    this.object = obj;
    this.id = id;
    Multi.addObject(this, id);
}

NetworkedObject.prototype.sendInput = function(input){
    
};