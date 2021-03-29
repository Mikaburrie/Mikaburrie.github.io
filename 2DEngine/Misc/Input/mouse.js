/**
 * @summary The mouse
**/
var Mouse = {
    down:false,
    click:false,
    dblclick:false,
    rightDown:false,
    rightClick:false,
    preventRight:false,
    middleClick:false,
    scroll:0,
    pageX:0,
    pageY:0,
    screenX:0,
    screenY:0,
    initialized:false,
    events:{ondown:[], onup:[], onclick:[], ondblclick:[], onscroll:[], onmove:[], onrclick:[], onrdown:[], onrup:[]},
    currentIndex:0,
    logEvents:false
};

/**
 * @summary Initializes the mouse.
**/
Mouse.init = function(){
    if(this.initialized){return;}
    window.addEventListener("mousedown", this.ondown);
    window.addEventListener("mouseup", this.onup);
    window.addEventListener("dblclick", this.ondblclick);
    window.addEventListener("wheel", this.onscroll);
    window.addEventListener("mousemove", this.onmove);
    window.addEventListener("contextmenu", this.onrclick);
    this.initialized = true;
};

/**
 * @summary Destroys the mouse.
**/
Mouse.destroy = function(){
    if(!this.initialized){return;}
    window.removeEventListener("mousedown", this.ondown);
    window.removeEventListener("mouseup", this.onup);
    window.removeEventListener("dblclick", this.ondblclick);
    window.removeEventListener("wheel", this.onscroll);
    window.removeEventListener("mousemove", this.onmove);
    window.removeEventListener("contextmenu", this.onrclick);
    this.initialized = false;
};

/**
 * @summary Returns the state of a certian action
 * @param {String} action The action to check for.
**/
Mouse.getAction = function(action){
    return this[action];
};

/**
 * @summary Handles a mouse click.
 * @param {MouseEvent} e The mouse event.
**/
Mouse.onclick = function(e){
    if(e.which == 3 || e.button == 2){ //if right click
        return;
    }
    Mouse.click = true;
    Mouse.getPos(e);
    Mouse.executeEvents("onclick");
};

/**
 * @summary Handles a mouse double click.
 * @param {MouseEvent} e The mouse event.
**/
Mouse.ondblclick = function(e){
    Mouse.dblclick = true;
    Mouse.getPos(e);
    Mouse.executeEvents("ondblclick");
};

/**
 * @summary Handles a mouse down.
 * @param {MouseEvent} e The mouse event.
**/
Mouse.ondown = function(e){
    if(e.which == 3 || e.button == 2){ //if right click
        Mouse.rightDown = true;
        Mouse.executeEvents("onrdown");
        return;
    }
    Mouse.down = true;
    Mouse.getPos(e);
    Mouse.executeEvents("ondown");
};

/**
 * @summary Handles a mouse up.
 * @param {MouseEvent} e The mouse event.
**/
Mouse.onup = function(e){
    if(e.which == 3 || e.button == 2){ //if right click
        Mouse.rightDown = false;
        Mouse.executeEvents("onrup");
        return;
    }
    Mouse.down = false;
    Mouse.getPos(e);
    Mouse.onclick(e);
    Mouse.executeEvents("onup");
};

/**
 * @summary Handles a mouse right click.
 * @param {MouseEvent} e The mouse event.
**/
Mouse.onrclick = function(e){
    if(Mouse.preventRight){e.preventDefault();}
    Mouse.click = false;
    Mouse.rightClick = true;
    Mouse.getPos(e);
    Mouse.executeEvents("onrclick");
};

/**
 * @summary Handles a mouse scroll.
 * @param {MouseEvent} e The mouse event.
**/
Mouse.onscroll = function(e){
    Mouse.scroll = Math.round(e.deltaY);
    Mouse.executeEvents("onscroll");
};

/**
 * @summary Handles a mouse move.
 * @param {MouseEvent} e The mouse event.
**/
Mouse.onmove = function(e){
    Mouse.getPos(e);
    Mouse.executeEvents("onmove");
};

/**
 * @summary Gets the mouse position.
 * @param {MouseEvent} e The mouse event.
**/
Mouse.getPos = function(e){
    this.pageX = e.pageX;
    this.pageY = e.pageY;
    this.screenX = e.screenX;
    this.screenY = e.screenY;
};

/**
 * @summary Sets mouse to prevent right click menu.
**/
Mouse.stopRight = function(){
    this.preventRight = true;
};

/**
 * @summary Updates the mouse values.
**/
Mouse.update = function(){
    this.click = false;
    this.dblclick = false;
    this.rightClick = false;
    this.middleClick = false;
    this.scroll = 0;
};

/**
 * @summary Adds a response to an event.
 * @param {string} event The name of the event to attach the response to.
 * @param {function} callback The function to respond to the event.
**/
Mouse.addEvent = function(event, callback){
    this.events[event].push(callback);
};

/**
 * @summary Removes a response to an event.
 * @param {string} event The name of the event to remove the response from.
 * @param {function} callback The function to remove from the event.
**/
Mouse.removeEvent = function(event, callback){
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
Mouse.removeAllEvents = function(){
    this.events = {ondown:[], onup:[], onclick:[], ondblclick:[], onscroll:[], onmove:[], onrclick:[], onrdown:[], onrup:[]};
};

/**
 * @summary Executes all responses for an event.
 * @param {string} event The name of the event to execute.
**/
Mouse.executeEvents = function(event){
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
Mouse.enableLogging = function(){
    this.logEvents = true;
};

/**
 * @summary Disables logging of events.
**/
Mouse.disableLogging = function(){
    this.logEvents = false;
};

/**
 * @summary Sets logging to log.
 * @param {boolean} log Whether to log or not.
**/
Mouse.setLogging = function(log){
    this.logEvents = log;
};