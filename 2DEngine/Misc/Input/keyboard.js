/**
 * @summary The keyboard
**/
var Keyboard = {
    keys:[],
    prevkeys:[],
    keyName:[],
    down:false,
    initialized:false,
    events:{keydown:[], keyup:[]},
    currentIndex:0,
    logEvents:false,
    doubleTapTicks: 20
    //more to come(blacklist, etc.)
};

/**
 * @summary Initializes the keyboard.
**/
Keyboard.init = function(doubleTapTicks){
    if(this.initialized){return false;}
    window.addEventListener("keydown", this.keyDown);
    window.addEventListener("keyup", this.keyUp);
    this.initialized = true;
    this.doubleTapTicks = doubleTapTicks || this.doubleTapTicks;
};

/**
 * @summary Destroys the keyboard.
**/
Keyboard.destroy = function(){
    if(!this.initialized){return;}
    window.removeEventListener("keydown", this.keyDown);
    window.removeEventListener("keyup", this.keyUp);
    this.initialized = false;
};

Keyboard.update = function(){
    Object.assign(this.prevkeys, this.keys);
};

/**
 * @summary Contains all key codes.
**/
Keyboard.key = {
    backspace:8, tab:9, enter:13, shift:16, ctrl:17, alt:18, esc:27, spacebar:32, space:32, arrowLeft:37, arrowUp:38, arrowRight:39,
    arrowDown:40, num0:48, num1:49, num2:50, num3:51, num4:52, num5:53, num6:54, num7:55, num8:56, num9:57, a:65, b:66, c:67,
    d:68, e:69, f:70, g:71, h:72, i:73, j:74, k:75, l:76, m:77, n:78, o:79, p:80, q:81, r:82, s:83, t:84, u:85, v:86, w:87,
    x:88, y:89, z:90, multiply:106, add:107, subtract:108, decimal:109, divide:110, semicolon:186, equal:187, comma:188, dash:189,
    period:190, forwardslash:191, graveaccent:192, openbracket:219, backslash:220, closebracket:221, singlequote:222
};

//creates literal number aliases for all numbers (num0 can also be 0)
for(var i = 0; i < 10; i++){
    Keyboard.key[i.toString()] = Keyboard.key["num" + i.toString()];
}

//generates keyName array (key code to name)
for(var i in Keyboard.key){
    Keyboard.keyName[Keyboard.key[i]] = i;
}

//generates event arrays
for(i in Keyboard.keyName){
    Keyboard.events[Keyboard.keyName[i]] = [];
}

/**
 * @summary Checks if key is pressed.
 * @param {string} keyName The key to get.
 * @return {boolean} Key is pressed.
**/
Keyboard.getKey = function(keyName){
    return this.keys[this.key[keyName]];
};

/**
 * @summary Returns if a key was just pressed.
 * @param {string} keyName The name of the key.
 * @return {boolean} Key is just released.
**/
Keyboard.justReleased = function(keyName){
    return !this.keys[this.key[keyName]] && this.prevkeys[this.key[keyName]];
};

/**
 * @summary Returns if a key was just released.
 * @param {string} keyName The name of the key.
 * @return {boolean} Key is just released.
**/
Keyboard.justPressed = function(keyName){
    return this.keys[this.key[keyName]] && !this.prevkeys[this.key[keyName]];
};

/**
 * @summary Fakes a key press.
 * @param {string} keyName The key to fake press.
**/
Keyboard.pressKey = function(keyName){
    this.keys[this.key[keyName]] = true;
};

/**
 * @summary Fakes a key release.
 * @param {string} keyName The key to fake release.
**/
Keyboard.releaseKey = function(keyName){
    delete this.keys[this.key[keyName]];
};

/**
 * @summary Handles key down.
 * @param {KeyboardEvent} e The event input.
**/
Keyboard.keyDown = function(e){
    Keyboard.keys[e.keyCode] = true;
    Keyboard.down = true;
    Keyboard.executeEvents("keydown");
    Keyboard.executeEvents(Keyboard.keyName[e.keyCode]);
};

/**
 * @summary Handles key up.
 * @param {KeyboardEvent} e The event input.
**/
Keyboard.keyUp = function(e){
    Keyboard.keys[e.keyCode] = false;
    Keyboard.down = false;
    Keyboard.executeEvents("keyup");
    Keyboard.executeEvents(Keyboard.keyName[e.keyCode]);
};

/**
 * @summary Adds a response to an event.
 * @param {string} event The name of the event to attach the response to.
 * @param {function} callback The function to respond to the event.
**/
Keyboard.addEvent = function(event, callback){
    this.events[event].push(callback);
};

Keyboard.registerDoubleTapKey = function(e){
    
}

/**
 * @summary Removes a response to an event.
 * @param {string} event The name of the event to remove the response from.
 * @param {function} callback The function to remove from the event.
**/
Keyboard.removeEvent = function(event, callback){
    for(var i in this.events[event]){
        if(this.events[event][i].name == callback.name){
            this.events[event].splice(i, 1);
            if(i == this.currentIndex){
                this.currentIndex--;
            }
            i--;
        }
    }
};

/**
 * @summary Removes all event responses.
**/
Keyboard.removeAllEvents = function(event, callback){
    this.events = {keydown:[], keyup:[]};
    for(i in Keyboard.keyName){
        Keyboard.events[Keyboard.keyName[i]] = [];
    }
};

/**
 * @summary Executes all responses for an event.
 * @param {string} event The name of the event to execute.
**/
Keyboard.executeEvents = function(event){
    if(this.events[event] == undefined){return;}
    for(this.currentIndex = 0; this.currentIndex < this.events[event].length; this.currentIndex++){
        this.events[event][this.currentIndex]();
    }
    
    if(this.logEvents){
        console.log(event);
    }
};

/**
 * @summary Enables logging of events.
**/
Keyboard.enableLogging = function(){
    this.logEvents = true;
};

/**
 * @summary Disables logging of events.
**/
Keyboard.disableLogging = function(){
    this.logEvents = false;
};

/**
 * @summary Sets logging to log.
 * @param {boolean} log Whether to log or not.
**/
Keyboard.setLogging = function(log){
    this.logEvents = log;
};