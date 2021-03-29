var http = require("http");
var WebSocketServer = require("websocket").server;

/**
 * @summary The server variable with settings.
**/
var Server = {
    autoAccept:false,
    httpServer:null,
    webSocket:null,
    connections:[],
    blacklist:[]
};

/**
 * @summary Specifies how a http request should be handeled.
 * @param {Request} request The http request.
 * @param {Response} response The response.
**/
Server.requestHandler = function(request, response){
    response.writeHead(200, {"Content-Type":"text/plain"});
    response.end();
};

/**
 * @summary Initialized the server.
**/
Server.init = function(){
    Server.httpServer = http.createServer(Server.requestHandler);
    Server.httpServer.listen(process.env.PORT, process.env.IP);
    Server.webSocket = new WebSocketServer({httpServer:Server.httpServer, acceptAutoConnections:false});
    Server.webSocket.on("request", Server.onrequest);
};

/**
 * @summary Stops the server.
**/
Server.destroy = function(){
    Server.webSocket.shutDown();
    Server.httpServer.close();
};

/**
 * @summary Handles request event.
 * @param {Request} request The request to establish connection.
**/
Server.onrequest = function(request){
    if(Server.originIsAllowed(request) || Server.autoAccept){
        console.log("Request from " + request.origin + ":" + request.remoteAddress + " accepted");
        var connection = request.accept("", request.origin);
        
        connection.id = Server.getOpenId();
        Server.addConnection(connection);
        
        Server.onconnect(connection);
        
        connection.on("message", function(message){Server._onmessage(connection, message)});
        connection.on("close", function(reasonCode, description){Server._onclose(connection, reasonCode, description)});
        
    }else{
        console.log("Request from " + request.origin + ":" + request.remoteAddress + " rejected");
        request.reject();
    }
};

/**
 * @summary Called when a new connection is made
 * @param {Connection} connection The new connection made.
**/
Server.onconnect = function(connection){
    
};

/**
 * @summary Layer between message recieve and response, decodes data type.
 * @param {Connection} connection The connection sending the message.
 * @param {Object} message The object containing data type and content.
**/
Server._onmessage = function(connection, message){
    //make sure the message is in utf8 format
    if(message.type == "utf8"){
        Server.onmessage(connection, message.utf8Data);
    }else if(message.type == "binary"){
        console.log("Message is in binary");
    }else{
        console.log("Message is not in a supported format.");
    }
};

/**
 * @summary Handles message from a connection.
 * @param {Connection} connection The connection sending the message.
 * @param {String} message Text string containing the message.
**/
Server.onmessage = function(connection, message){
    
};

/**
 * @summary Handles a connection close.
 * @param {Connection} connection The connection closed.
 * @param {Integer} reasonCode The status code of the closing.
 * @param {String} description A description of the closing code if avaliable.
**/
Server._onclose = function(connection, reasonCode, description){
    console.log(connection.remoteAddress + " disconnected" + (reasonCode == 1000 ? "" : " with code " + reasonCode) +
            (description != undefined ? ("\n" + description) : ""));
    Server.onclose(connection, reasonCode, description);
    Server.removeConnection(connection);
};

/**
 * @summary Called when a connection closes.
 * @param {Connection} connection The closed connection.
 * @param {Integer} reasonCode The status code of the closing.
 * @param {String} description A description of the closing code if avaliable.
**/
Server.onclose = function(connection, reasonCode, description){
    
};

/**
 * @summary Sends a message to a specified connection.
 * @param {Integer} connectionId The connection to send the message to.
 * @param {String} message The message to send.
**/
Server.sendTo = function(connectionId, message){
    Server.connections[connectionId].sendUTF(message);
};

/**
 * @summary Sends a message to all connections.
 * @param {String} message The message to send.
**/
Server.sendAll = function(message){
    for(var i in Server.connections){
        Server.connections[i].sendUTF(message);
    }
};

/**
 * @summary Determines whether a request is allowed to connect.
 * @param {Request} request The request made to the server.
 * @return {Boolean} Whether the request is allowed or not.
**/
Server.originIsAllowed = function(request){
    for(var i in Server.blacklist){
        if(Server.blacklist[i] == request.origin){
            console.log("Origin " + request.origin + " disallowed");
            return false;
        }
        
        if(Server.blacklist[i] == request.remoteAddress){
            console.log("Remote address " + request.remoteAddress + " disallowed");
            return false;
        }
    }
    return true;
};

/**
 * @summary Gets the next avaliable id for a connection.
 * @return {Integer} The first open id avaliable to be filled.
**/
Server.getOpenId = function(){
    for(var i = 0; i < Server.connections.length; i++){
        if(Server.connections[i] == undefined){
            return i;
        }
    }
    return Server.connections.length;
};

/**
 * @summary Adds a connection to the list of connections.
 * @param {Connection} connection The connection being added.
**/
Server.addConnection = function(connection){
    Server.connections[connection.id] = connection;
};

/**
 * @summary Removes a connection.
 * @param {Connection} connection The connection to be removed.
**/
Server.removeConnection = function(connection){
    delete Server.connections[connection.id];
    connection.close();
};

/**
 * @summary Adds an item to the blacklist(origin or ip).
 * @param {String} str The string to add to the blacklist.
**/
Server.addBlacklist = function(str){
    Server.blacklist.push(str);
};

/**
 * @summary Removes an item from the blacklist(origin or ip).
 * @param {String} str The string to remove from the blacklist.
**/
Server.removeBlacklist = function(str){
    for(var i in Server.blacklist){
        if(Server.blacklist[i] == str){
            Server.blacklist.splice(i, 1);
            i--;
        }
    }
};

module.exports = Server;