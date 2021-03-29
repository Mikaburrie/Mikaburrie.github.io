/* global Keyboard engine PIXI Camera Entity Player use*/
var screen = {};
var ui = {};
var world = {};
var socket;

use("multiplayer");
use("keyboard");
use("objectHandeler")

function load(){
    loadRes(init);
}

function loadRes(callback){
    //variables to keep load state
    world.loaded = 0;
    world.loading = 0;
    
    var checkLoad = function(){
        if(world.loaded == world.loading){
            console.log("All Resources Loaded.");
            callback();
        }else{
            window.setTimeout(checkLoad, 10);
        }
    };
    
    checkLoad();
}

function init(){
    //specify how many displayed pixels the user will see, if unspecified, will use max pixels possible
    screen.width = 1600;
    screen.height = 900;
    screen.app = new PIXI.Application(screen.width, screen.height, {backgroundColor : 0x000000});
    screen.app.view.setAttribute("id", "canvas"); //set an id so this can be dynamically resized
    document.body.appendChild(screen.app.view);
    
    //floor pixels for crisp pixel art
    screen.app.renderer.roundPixels = true;
    
    //screen aspectRatio
    screen.aspectRatio = 16/9;
    
    //make canvas resize with window
    resize();
    window.addEventListener("resize", resize, false);//resize the canvas on window resize
    window.addEventListener("deviceOrientation", resize, false);//resize the canvas on screen orientation change
    
    //Global container
    screen.container = new PIXI.Container();
    screen.app.stage.addChild(screen.container);
    
    Keyboard.init();
    world.entities = [];
    world.entities.push(new Player(0, 0, 0));
    
    screen.app.ticker.add(run);
}

function run(delta){
    
    //game pipeline: 1. global logic 2. update individual objects 3. physics  4. render 5. input
    gameLogic();
    update();
    physics();
    render();
    
    Keyboard.update();
}

function gameLogic(){
    
}

function update(){
    for(var i = 0; i < world.entities.length; i++){
        world.entities[i].update();
    }
}

function physics(){
    for(var i = 0; i < world.entities.length; i++){
        world.entities[i].physics();
    }
}

function render(){
    for(var i = 0; i < world.entities.length; i++){
        world.entities[i].render();
    }
    /*
    //clear screen and reset screen width and height for resize
    screen.canvas.clearRect(0, 0, screen.canvas.width, screen.canvas.height);//clear screen
    */
}

function resize(){//maximize the size of the canvas with the same aspect ratio
    var width = window.innerHeight * screen.aspectRatio;
    var height = window.innerWidth / screen.aspectRatio;
    
    //test if window width or height is smaller than what a canvas of standard aspect ratio should be
    if(window.innerWidth / screen.aspectRatio > window.innerHeight){//window width is greater, add padding to width only
        //resize output to physical pixels
        screen.app.view.width = screen.width || width * window.devicePixelRatio;
        screen.app.view.height = screen.height || window.innerHeight * window.devicePixelRatio;
        
        //resize to webpage
        screen.app.view.style.width = width + "px";
        screen.app.view.style.height = window.innerHeight + "px";
    }else{//window height is greater, add padding to height only
        //resize output to physical pixels
        screen.app.view.height = screen.height || height * window.devicePixelRatio;
        screen.app.view.width = screen.width || window.innerWidth * window.devicePixelRatio;
        
        //resize to webpage
        screen.app.view.style.height = height + "px";
        screen.app.view.style.width = window.innerWidth + "px";
    }
    //resize viewport
    screen.app.renderer.resize(screen.app.view.width, screen.app.view.height);
}

function loadJSON(path, callback) {   
    var request = new XMLHttpRequest();
    request.overrideMimeType("application/json");
    request.open('GET', path, true);
    request.onload = function(){
        callback(JSON.parse(request.responseText));
    };
    request.send();//send the request
}

engine.onload = load;