//incase browser doesn't have a console(it can happen and will throw errors!)
console = console || {log: function(a){this.stack += "[LOG]:" + a + " /n "},
                      info: function(a){this.stack += "[INFO]:" + a + " /n "},
                      warn: function(a){this.stack += "[WARN]:" + a + " /n "},
                      error: function(a){this.stack += "[ERROR]:" + a + " /n "}, stack: ""};

getWindowDimensions(); //gets window dimensions

Math.randInt = function(min, max){
    return Math.floor(Math.random() * (max + 1 - min) + min);
};

var loop = window.requestAnimationFrame || window.webkitRequestAnimationFrame || //for looping
             window.mozRequestAnimationFrame || window.msRequestAnimationFrame ||
             window.oRequestAnimationFrame || function(callback){window.setTimeout(callback, 1000/60);};

var pkgs = {};

/**
 * @summary Adds a new package to the manager.
 * @param {string} pkg The name of the package.
 * @param {string} path The path in the file system of the package.
**/
pkgs.add = function(pkg, path){
    this[pkg] = path;
};

/**
 * @summary Logs a list of the packages avaliable.
**/
pkgs.list = function(){
    var result = "";
    for(var i in this){
        result += i + ", ";
    }
    console.log(result.substr(0, result.length - 2));
    return result.substr(0, result.length - 2);
};

//add packages
pkgs.add("display", "Graphics/display.js");
pkgs.add("bitmap", "Graphics/bitmap.js");
pkgs.add("pixi", "Graphics/PIXI/pixi.min.js");
pkgs.add("simpPhysics", "Physics/Base.js");
pkgs.add("time", "Misc/time.js");
pkgs.add("keyboard", "Misc/Input/keyboard.js");
pkgs.add("mouse", "Misc/Input/mouse.js");
pkgs.add("procedural", "Misc/ProceduralGen/basicprocedural.js");
pkgs.add("imageHandeler", "Handelers/imageHandeler.js");
pkgs.add("socket", "Network/Socket/client.js");
pkgs.add("multiplayer", "Network/Multi/client.js");
pkgs.add("webRTC", "Network/WebRTC/client.js");
pkgs.add("objectHandeler", "Handelers/objectHandeler.js");


//determines the path of where to fetch packages from
var scripts = document.getElementsByTagName("script");
for(var i in scripts){
    var src = scripts[i].src;
    if(src && src.indexOf("/2D.js") > -1){
        pkgs.prefix = src.substring(0, src.indexOf("2D.js"));
    }
}
scripts = undefined;


var engine = {};
engine.pkgsToLoad = 0;
engine.pkgsUsed = 0;
engine.onload = function(){};

/**
 * @summary Loads the package pkg and call callback(optional) when loaded
 * @param {string} pkg The package to be used.
 * @param {function} callback Optional. Callback function for actions on script load.
**/
function use(pkg, callback){
    if(pkgs[pkg] == undefined){
        console.warn("Invalid package: " + pkg + ". Package will not be loaded");
        return;
    }else if(pkgs[pkg] == "used"){
        return;
    }

    var script = document.createElement("script");
    script.type = "text/javascript";
    if(script.readyState && !!callback){ //IE
        script.onreadystatechange = function(){
            if(script.readyState == "loaded" || screen.readyState == "complete"){
                script.onreadystatechange = undefined;
                callback();
            }
        };
    }else if(!!callback){ //other browsers
        script.onload = callback;
    }
    script.src = pkgs.prefix + pkgs[pkg];
    document.head.appendChild(script);
    engine.pkgsToLoad++;
    engine.pkgsUsed++;

    if(!!script){
        if(script.attachEvent){ //IE 6-10
            script.attachEvent("onload", pkgLoaded);
        }else{ //other browsers
            script.addEventListener("load", pkgLoaded, false);
        }
    }
    pkgs[pkg] = "used";
}

if(window.attachEvent){ //IE 6-10
    window.attachEvent("onload", windowLoaded);
}else{ //other browsers
    window.addEventListener("load", windowLoaded, false);
}

/**
 * @summary Sets the speed at which to loop at.
 * @param {int} ups The target update per second speed.
**/
function setLoopSpeed(ups){

}

/**
 * @summary classToExtend inherits from extendFrom.
 * @param {function} classToExtend The class to extend.
 * @param {function} extendFrom The class to extend from.
**/
function extend(classToExtend, extendFrom){
    classToExtend.prototype = new extendFrom();
    classToExtend.prototype.constructor = classToExtend;
    classToExtend.prototype.parent = extendFrom;
}

/**
 * @summary Called when window is loaded.
**/
function windowLoaded(){
    if(window.loaded != undefined){
        console.warn("Window.loaded namespace taken, engine initialization stopped");
        return;
    }
    window.loaded = true;
    console.log("Window loaded");
    checkWindowReady();
}

/**
 * @summary Called when package is loaded.
**/
function pkgLoaded(){
    engine.pkgsToLoad--;
    checkPkgsLoaded();
}

/**
 * @summary Checks if all packages are loaded.
**/
function checkPkgsLoaded(){
    if(engine.pkgsToLoad == 0 && engine.pkgsUsed != 0){
        console.log("Packages loaded");
        checkWindowReady();
    }
}

/**
 * @summary Checks if window and all packages are loaded.
**/
function checkWindowReady(){
    if(window.loaded == true && !engine.pkgsToLoad){
        console.log("Engine ready, Initializing");
        engine.onload();
    }
}

/**
 * @summary Gets the width and height of the window.
**/
function getWindowDimensions(e){
    var body = document.documentElement.getElementsByTagName('body')[0];
    window.width = window.innerWidth || document.documentElement.clientWidth || body.clientWidth,
    window.height = window.innerHeight || document.documentElement.clientHeight || body.clientHeight;
    body = undefined; //garbage
}

/**
 * @summary Calls getWindowDimensions when the window is resized.
**/
window.addEventListener("resize", getWindowDimensions, false);
