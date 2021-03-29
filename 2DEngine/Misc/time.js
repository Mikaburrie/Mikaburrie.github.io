/**
 * @summary Creates a new timer.
 * @class
**/
function Timer(){
    this.running = false;
    this.duration = 0;
    this.startTime = 0;
    this.stopTime = 0;
}

/**
 * @summary Starts this timer.
**/
Timer.prototype.start = function(){
    this.duration = 0;
    this.running = true;
    this.startTime = Date.now();
};

/**
 * @summary Stops the timer.
 * @return {int} The duration in milliseconds.
**/
Timer.prototype.stop = function(){
    this.running = false;
    this.stopTime = Date.now();
    this.duration = this.stopTime - this.startTime;
    return this.duration;
};

/**
 * @summary Restarts the timer.
 * @return {int} The duration in milliseconds.
**/
Timer.prototype.reset = function(){
    let duration = this.stop();
    this.start();
    return duration;
};

/**
 * @summary Creates a new DeltaTime instance.
 * @param {float} dt Optional. The deltaTime, defaults to 1/60.
 * @class
**/
function DeltaTime(dt){
    this.dt = dt || 1/60;
    this.time = 0;
    this.currentTime = Date.now();
    this.previousTime = Date.now();
    this.delta = 0;
    this.accumulator = 0;
    this.fps = [];
    this.fpsSample = 10;
    this.findDelta();
}

/**
 * @summary Sets the delta time.
 * @param {float} dt The new deltaTime.
**/
DeltaTime.prototype.setDeltaTime = function(dt){
    this.dt = dt;
};

/**
 * @summary Sets the fps.
 * @param {int} fps The target fps.
**/
DeltaTime.prototype.setFps = function(fps){
    //just a different way to do the same exact thing.
    this.dt = 1/fps;
};

/**
 * @summary Gets the fps.
 * @return {float} The fps.
**/
DeltaTime.prototype.getFps = function(){
    var fps = 0;
    for(var i in this.fps){
        fps += this.fps[i];
    }
    return fps/this.fps.length;
};

/**
 * @summary Finds the delta time.
**/
DeltaTime.prototype.findDelta = function(){
    this.currentTime = Date.now();
    this.accumulator += (this.currentTime - this.previousTime) / 1000;
    this.delta = (this.currentTime - this.previousTime)/1000/this.dt;
    if(this.delta == Infinity){this.delta = 0;}
    this.time += this.currentTime - this.previousTime;
    this.previousTime = this.currentTime;
    this.fps.unshift(1/this.delta/this.dt);
    while(this.fps.length > this.fpsSample){this.fps.pop()}
};

/**
 * @summary Loops through the accumulator and calls callback.
 * @param {function} callback The function to call.
**/
DeltaTime.prototype.loopDelta = function(callback){
    while(this.accumulator >= this.dt){
        callback();
        this.accumulator -= this.dt;
    }
};
