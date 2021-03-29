/**
 * @class
 * @summary A web socket handeler
 * @param {String} url The url of the web socket.
 * @param {String|Array} protocol Optional. The protocol(s) for the socket.
**/
function Socket(url, protocol){
    this.url = url;
    this.protocol = protocol || "";
    this.socket = null;
    this.connected = false;
}

/**
 * @summary Initializes the socket.
**/
Socket.prototype.init = function(){
    if(this.connected){
        console.warn("Socket already initialized.");
        return;
    }
    
    if(this.protocol != ""){
        this.socket = new WebSocket(this.url, this.protocol);
    }else{
        this.socket = new WebSocket(this.url);
    }
    this.socket.parent = this;
    this.socket.onopen = function(e){this.parent.connected = true; this.parent.onopen(e);};
    this.socket.onmessage = function(e){this.parent.onmessage(e);};
    this.socket.onclose = function(e){this.parent.connected = false; this.parent.onclose(e);};
    this.socket.onerror = this.onerror;
};

/**
 * @summary Shuts down the socket.
**/
Socket.prototype.destroy = function(){
    if(!this.connected){
        console.warn("Socket already destroyed.");
        return;
    }
    this.connected = false;
    
    this.socket.close(1000);
    delete this.socket;
};

/**
 * @summary Called when the socket establishes connection with the server.
 * @param {Event} e The event of the opening.
**/
Socket.prototype.onopen = function(e){
    console.log("Connected to server.");
};

/**
 * @summary Called when the socket recieves a message.
 * @param {MessageEvent} e The message.
**/
Socket.prototype.onmessage = function(e){
    
};

/**
 * @summary Called when the socket connection closes.
 * @param {CloseEvent} e The close event.
**/
Socket.prototype.onclose = function(e){
    if(!e.wasClean){//check if closed cleanly
        console.log("Disconnected from server with code " + e.code + (e.reason ? ". " + e.reason + "." : "."));
    }else{
        console.log("Disconnected from server.");
    }
};

/**
 * @summary Called when the socket encounters an error.
 * @param {} e The error event.
**/
Socket.prototype.onerror = function(e){
    
};

/**
 * @summay Sends a message to the server.
 * @param {String} data The message to send.
**/
Socket.prototype.send = function(data){
    if(this.socket.readyState == this.socket.OPEN && this.connected){
        this.socket.send(data);
    }else if(this.connected){
        this.connected = false;
        console.warn("Socket not open or lost connection, messages won't be sent.");
    }
};

/**
 * @summary Closes the socket connection.
 * @param {Integer} code Optional. The status code for the close.
 * @param {String} reason Optional. The reason for closing.
**/
Socket.prototype.close = function(code, reason){
    if(reason){
        this.socket.close(code, reason);
    }else if(code){
        this.socket.close(code);
    }else{
        this.socket.close();
    }
};