/* global use Socket RTCPeerConnection */
use("socket");

var RTC = {
    socket: null,
    connection: null,
    peer: "",
    connected: false,
    incomingRequests: [],
    dataChannels: {}
};

RTC.init = function(url, config){
    this.socket = new Socket(url);
    this.socket.onopen = function(e){RTC.onopen(e);};
    this.socket.onmessage = function(e){RTC.onmessage(JSON.parse(e.data), e);};
    this.socket.init(this.server);
    
    this.connection = new RTCPeerConnection(config);
    this.connection.onicecandidate = function(e){RTC.sendIceCandidate(e)};
    this.connection.onremovestream = function(e){console.log(e)};
    this.connection.oniceconnectionstatechange = function(e){console.log(RTC.connection.iceConnectionState)};
    this.connection.onicegatheringstatechange = function(e){console.log(RTC.connection.iceGatheringState)};
    this.connection.onsignalingstatechange = function(e){console.log(RTC.connection.signalingState)};
    this.connection.onnegotiationneeded = function(e){console.log("Negotiation needed")};
    this.connection.ontrack = function(e){RTC.handleMedia(e)};
    this.connection.ondatachannel = function(e){RTC.handleData(e)};
    
};

RTC.sendIceCandidate = function(e){
    this.sendTo(this.peer, "icecandidate", e.candidate);
};

RTC.handleIceCandidate = function(candidate){
    if(candidate == null){
        console.log("Finished ice negotiation");
        return;
    }
    this.connection.addIceCandidate(candidate).catch(function(e){console.log(e)});
};

RTC.handleMedia = function(e){
    this.onmedia(e.streams);
};

RTC.onmedia = function(streams){};

RTC.handleData = function(e){
    RTC.ondata(new this.DataChannel(e.channel));
};

RTC.ondata = function(channel){};

RTC.onopen = function(e){
    console.log("Connected to signal server");
};

RTC.onmessage = function(message, e){
    var id = message[0], type = message[1], payload = message[2];
    //console.log(type, payload);
    switch (type) {
        case "id":
            if(id == "server"){
                this.id = payload;
                console.log("Assigned id " + this.id);
            }else{
                console.log("Unauthorized attempt to change id");
            }
        break;
        case "error":
            console.log(message);
        break;
        case "request":
            this.incomingRequests.push(id);
            this.onconnectionrequest(id, payload);
        break;
        case "response":
            this.onconnectionresponse(id, payload);
        break;
        case "icecandidate":
            this.handleIceCandidate(payload);
        break;
        default:
            console.log("Unknown type: " + message[1]);
        break;
    }
};

RTC.sendTo = function(id, type, body){
    this.socket.send(JSON.stringify([id, type, body]));
};

RTC.sendRequest = function(id){
    RTC.connection.createOffer().then(function(e){
        RTC.connection.setLocalDescription(e);
        RTC.sendTo(id, "request", e);
        RTC.peer = id;
    }).catch(function(e){console.log(e)});
};

RTC.onconnectionrequest = function(id, description){
    console.log("Connection request from " + id);
    RTC.connection.setRemoteDescription(description).catch(function(e){console.log(e)});
    RTC.connection.createAnswer().then(function(e){
        RTC.connection.setLocalDescription(e);
        RTC.sendTo(id, "response", e);
        RTC.peer = id;
    }).catch(function(e){console.log(e)});
};

RTC.onconnectionresponse = function(id, description){
    console.log("Response from " + id);
    RTC.connection.setRemoteDescription(description);
    this.connected = true;
};

RTC.answerRequest = function(id, accept){
    if(accept){
        this.sendTo(this.peer, "response", "");
        this.connected = true;
        return;
    }
    this.peer = null;
};

RTC.addMediaChannel = function(video, audio, callback){
    window.navigator.mediaDevices.getUserMedia({video: video, audio: audio}).then(function(stream){
        stream.getTracks().forEach(track => RTC.connection.addTrack(track, stream));
        callback(stream);
    }).catch(function(e){
        var device = (video ? " camera" : "") + (video && audio ? " or" : "") + (audio ? " microphone" : "");
        switch(e.name){
            case "NotFoundError":
                console.warn("Invalid Media: No usable" + device + " found");
            break;
            case "SecurityError":
            case "PermissionDeniedError":
                //when user says no
            break;
            default:
                console.warn("Error opening" + device);
            break;
        }
        callback(null);
    });
};

RTC.addDataChannel = function(name, options){
    return new this.DataChannel(this.connection.createDataChannel(name, options));
};

RTC.DataChannelOptions = function(){
    this.ordered = true;
    this.maxPacketLife = null;
    this.maxRetransmist = null;
    this.protocol = "";
    this.negotiated = false;
};

RTC.DataChannel = function(channel){
    RTC.dataChannels[channel.label] = this;
    this.channel = channel;
    this.channel.bufferedAmountLowThreshold = 
    this.sendBuffer = [];
    this.expectMessage = false;
    
    this.channel.onopen = function(e){
        this.onopen(e);
    }.bind(this);
    
    this.channel.onmessage = function(e){
        this._onmessage(e);
    }.bind(this);
    
    this.channel.onclose = function(e){
        this.onclose(e);
    }.bind(this);
    
    this.channel.onerror = function(e){
        this.onerror(e);
    }.bind(this);
    
    this.channel.onbufferedamountlow = function(e){
        console.log(e);
    }.bind(this);
};

RTC.DataChannel.prototype.onopen = function(e){
    console.log("Opened data channel");
};

RTC.DataChannel.prototype._onmessage = function(e){
    console.log(e);
};

RTC.DataChannel.prototype.onmessage = function(message){
    console.log(message);
};

RTC.DataChannel.prototype.onclose = function(e){
    
};

RTC.DataChannel.prototype.onerror = function(e){
    
};

RTC.DataChannel.prototype.send = function(message){
    this._send(message.constructor.name, message);
};

RTC.DataChannel.prototype._send = function(type, message){
    this.sendBuffer.push(type, message);
};

RTC.DataChannel.prototype.ping = function(){
    this._send("ping", "");
};

RTC.DataChannel.prototype.close = function(){
    this.channel.close();
};