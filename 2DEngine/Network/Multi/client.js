/* global use Socket Objects */

use("socket", function(){Multi.onload();});

var Multi = {
    instance: "client",
    socket: null,
    classReg: {},
    objects: [],
    objectArray: null,
    createResponse: null,
    tick: 0,
    clientId: null,
    dataBuffer: [],
    updateRate: 60,
    sendRate: 20,//should this technically be recieveRate????
    interpTime: 0.1,
    syncRate: 0.3, //should not be greater than 1
    frame: 0,
    objectHandeler: false,
    firstTick: true,
    netIndex: null,
    customMessages: {},
    latency: 0,
    lastPing: 0,
    pingFrequency: 2,
    pinging: false,
    serverTick: 0,
    sendErrors: false,
    inputBuffer: [],
    inputSent: 0,
    inputProcessed: -1,
    converging: true,
    convergenceRate: 0.1, // should not exceed 1
    predictErrorThreshold: 1,
    logError: false,
    onopen: function(){},
    onload: function(){}
};

Multi.init = function(url, protocol){
    if(!!window.Objects){ //if the object handeler is detected
        this.objectHandeler = Objects.handeler || false;
    }
    this.socket = new Socket(url, protocol);
    this.socket.onmessage = function(e){Multi.onmessage(JSON.parse(e.data), e.timeStamp)};
    this.socket.onopen = Multi.onopen;
    this.socket.init();
    
    window.addEventListener("error", function(e){
        if(Multi.sendErrors){
            Multi.sendMessage("error", e.error.stack);
        }
    }, false);
};

Multi.close = function(code, reason){
    this.socket.close(code, reason);
};

Multi.update = function(){
    //determine buffer index
    Multi.findBufferIndex();
    
    if(this.index != -1){
        //input logic
        Multi.updateInput();
        //apply index
        Multi.applyUpdate();
    }
    
    Multi.incrementTick();
};

Multi.findBufferIndex = function(){
    this.frame = this.tick - (this.updateRate * this.interpTime);//find render frame
    for(var i = 0; i < this.dataBuffer.length && this.dataBuffer[i].tick > this.frame; i++){} //get index
    if(this.dataBuffer[i] == undefined){
        this.index = -1;
        return;
    }
    
    if(i == 0){ //if the buffer is using most current snapshot
        if(!this.dataBuffer[1]){ //check if its the only one
            this.dataBuffer[1] = this.dataBuffer[0]; //fill next index to avoid errors
        }
        i = 1; //increment index so two valid frames are present
    }
    this.index = i;
};

Multi.updateInput = function(){
    this.inputProcessed = this.dataBuffer[this.index].input;
    
    //shift away all input frames that have been accepted by the server
    while(0 < this.inputBuffer.length && this.inputBuffer[0]._inNum <= this.inputProcessed){
        this.inputBuffer.shift();
    }
};

Multi.applyUpdate = function(){
    //determine the two snapshots and interpolation ratio between the frames
    var prevFrame = this.dataBuffer[this.index].data, nextFrame = this.dataBuffer[this.index - 1].data;
    var interpFactor = (this.frame - this.dataBuffer[this.index].tick)/(this.updateRate/this.sendRate);//passed frames per (updates per send)
    for(var i = 0, len = Math.max(Multi.objects.length, prevFrame.length, nextFrame.length) + 2; i < len; i++){ //loop through objects in snapshot
        if(!this.objectStateChange(i, prevFrame[i], nextFrame[i]) && this.objects[i]){ //detects if object is new or to be deleted
            this.updateObject(i, prevFrame[i], nextFrame[i], interpFactor); //applies position
            this.predictObject(i, prevFrame[i], nextFrame[i], interpFactor); //applies prediction
        }
    }
    
    //always send most recent input frame (we don't want to resend unaccepted input frames - TCP takes care of that)
    this.sendMessage("input", this.inputBuffer[this.inputBuffer.length - 1] || {});
    
    this.inputSent++; //esentially a time id for the input frame
    this.inputBuffer.push({_inNum:this.inputSent});

    delete this.firstTick;
};

Multi.objectStateChange = function(id, obj, nextObj){
    if(obj == null && this.objects[id]){ //object stopped being sent
        this.objects[id].destroy(); //destroy
    }else if(!!obj & !this.objects[id]){ //object is new
        obj = this.createClass(obj[0], id, obj.slice(1, obj.length)); //create
        this.onobjectcreate(obj);
    }
    
    return (!obj == !!nextObj) && !!obj;
};

Multi.updateObject = function(id, obj, nextObj, interp){
    var index = this.netIndex[obj[0]].vars;
    var object = this.objects[id];
    for(var i = 0, len = index.length; i < len; i++){//loop through variables(objects) and interpolate, or take the previous frame in case
        if(index[i].interp && !(this.objects[id].isPlayer && this.netIndex[obj[0]].predict)){ //smooth value between frame
            object.obj[index[i].name] = this.interp(obj[i + 1], nextObj[i + 1], interp);
        }else{ //take from prev frame, provided no convergence is wanted
            
        }
    }
};

Multi.predictObject = function(id, obj, nextObj, interp){
    var index = this.netIndex[obj[0]].vars;//TODO temp
    
    if(!this.objects[this.clientId]){return;}
    if(this.netIndex[obj[0]].predict && (this.objects[this.clientId].obj.constructor.name != obj[0] || id == this.clientId)){// if this needs to be predicted
        this.objects[id].updatePrediction(obj, this.inputProcessed, this.inputSent);
    }
};

Multi.interp = function(start, end, amt){
    return start + (end - start) * amt;
};

Multi.incrementTick = function(){
    this.tick++;
    this.serverTick++;
    var diff = this.serverTick - this.tick;
    if(Math.abs(diff) > this.updateRate/2){ //if more than half second off
        this.tick = this.serverTick; //cold assignment
    }else{
        this.tick += this.syncRate * diff;//catch up to the server time
    }
    
    if(this.serverTick % (this.updateRate/this.pingFrequency) < 1 && !this.pinging){
        this.sendMessage("ping", this.latency);
        this.lastPing = Date.now();
        this.pinging = true;
    }
};

Multi.registerClass = function(regClass, className){
    this.classReg[className] = regClass;
};

Multi.createClass = function(className, id, initialState){
    var index = this.netIndex[className];
    var params = [];
    
    for(var i in index.params){
        params[i] = initialState[index.params[i]];
    }
    
    var obj;
    if(this.classReg[className]){
        obj = new this.classReg[className](...params);
    }else{
        obj = new window[className](...params);
    }
    obj._net = new NetworkedObject(obj, id);
    index = index.vars;
    for(i in index){
        obj[index[i].name] = initialState[i];
    }
    return obj;
};

Multi.setObjectArray = function(array){
    this.objectArray = array;
};

Multi.setCreationResponse = function(response){
    this.createResponse = response;
};

Multi.onobjectcreate = function(obj){
    if(this.objectHandeler){
        Objects.addObject(obj);
    }else if(!!this.objectArray){
        this.objectArray.push(obj);
    }else if(!!this.createResponse){
        this.createResponse(obj);
    }else{
        console.error("Unset Object Handeler: Please specify a response, array, or use the Object Handeler.");
    }
};

Multi.sendInput = function(input){
    this.inputBuffer[this.inputBuffer.length - 1][input] = 1; //shorthand for true
};

Multi.compensate = function(){
    this.inputBuffer[this.inputBuffer.length - 1]._comp = Math.round(this.tick); //shorthand for true
};

Multi.sendMessage = function(type, data){
    this.socket.send(JSON.stringify([type, data]));
};

Multi.isPlayer = function(obj){
    if(!obj._net){
        console.warn("isPlayer method should not be called in the constructor of an object.");
    }else if(obj._net.id == this.clientId){
        return true;
    }
    return false;
};

Multi.onmessage = function(message, timestamp){
    this.serverTick = message[1];
    switch(message[0]){
        case "update":
            var input = message[2].shift();
            this.dataBuffer.unshift({tick: message[1], data: message[2], input: input});
            while(this.dataBuffer.length > Math.max(this.sendRate * this.interpTime + 2, 2)){
                this.dataBuffer.pop();
            }
            for(var i in this.dataBuffer.data){
                if(this.dataBuffer.data[i][2]){
                    console.log(this.dataBuffer.data[i][2]);
                }
            }
        break;
        case "index":
            this.netIndex = message[2];
        break;
        case "ping":
            this.latency = Date.now() - this.lastPing;
            this.pinging = false;
        break;
        case "id":
            this.clientId = message[2];
        break;
        default:
            if(this.customMessages[message[0]]){
                this.customMessages[message[0]](message[2]);
            }
        break;
    }
};

Multi.addCustomMessage = function(type, response){
    this.customMessages[type] = response;
};



function NetworkedObject(obj, id){
    this.obj = obj;
    this.id = id;
    this.del = false;
    this.isPlayer = (this.id == Multi.clientId);
    this.positionHistory = [];
    Multi.objects[id] = this;
}

NetworkedObject.prototype.pushCurrentState = function(inputSent){
    this.positionHistory.push({_inNum:inputSent});
    var index = Multi.netIndex[this.obj.constructor.name].vars;
    for(var i in index){
        this.positionHistory[this.positionHistory.length - 1][index[i].name] = this.obj[index[i].name];
    }
};

NetworkedObject.prototype.updatePrediction = function(serverState, inputProcessed, inputSent){
    let index = Multi.netIndex[this.obj.constructor.name].vars;
    
    this.obj.predict(Multi.inputBuffer[Multi.inputBuffer.length - 1] || {});
    
    //pushes current prediction to stack
    this.pushCurrentState(inputSent);
    
    //removes resolved predictions
    while(this.positionHistory[0]._inNum < inputProcessed){
        this.positionHistory.shift();
        if(this.positionHistory.length == 0){
            return;
        }
    }
    
    //checks if prediction is matching the frame
    if(this.positionHistory[0]._inNum == inputProcessed){
        var error;
        if(Multi.logError){
            error = {};
            for(i in index){
                error[index[i].name] = Math.abs(this.positionHistory[0][index[i].name] - serverState[Number(i) + 1]);
            }
            console.log(error);
        }
        
        error = 0;
        for(i in index){
            error += Math.abs(this.positionHistory[0][index[i].name] - serverState[Number(i) + 1]) * index[i].predict;
        }
        
        
        if(error > Multi.predictErrorThreshold){
            console.log("error", Multi.latency);
            
            this.positionHistory.length = 0;
            for(var i in index){
                this.obj[index[i].name] = serverState[Number(i) + 1];
            }
       
            this.pushCurrentState(inputProcessed);
            
            for(i in Multi.inputBuffer){
                this.obj.predict(Multi.inputBuffer[i]);
                this.pushCurrentState(Multi.inputBuffer[i]._inNum);
            }
        }
    }
};

NetworkedObject.prototype.destroy = function(){
    if(Multi.objectHandeler){
        Objects.removeObject(this.obj);
    }else{
        this.del = true;
        this.obj.del = true;
    }
    delete Multi.objects[this.id];
};