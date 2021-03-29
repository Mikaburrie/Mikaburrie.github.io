var temp = require("./../Network/Multi/server.js");
var Multi = temp.Multi, NetworkedObject = temp.NetworkedObject;

Multi.init();

Multi.onconnect = function(){
    var player = new Player(Math.random() * 780, Math.random() * 580);
    objects.push(player);
    return player;
};

var objects = [new Test()];
function update(){
    for(var i = 0; i < objects.length; i++){
        objects[i].update();
        if(objects[i].del){
            objects.splice(i, 1);
            i--;
        }
    }
    
    Multi.update();
}

Multi.targetClass(Player);
Multi.setPredictable();
Multi.defineVar("float", "x", true, 2, 0.5);
Multi.defineVar("float", "y", true, 2, 0.5);
Multi.defineVar("float", "velX", true, 3, 1);
Multi.defineVar("float", "velY", true, 3, 1);
function Player(x, y){
    this.net = new NetworkedObject(this);
    this.x = x;
    this.y = y;
    this.velX = 0;
    this.velY = 0;
    this.width = 20;
    this.height = 20;
    this.speed = .5;
    this.drag = 0.9;
}

Player.prototype.update = function(){
    
};

Player.prototype.oninput = function(inputFrame){
    if(inputFrame.w){
        this.velY -= this.speed;
    }
    
    if(inputFrame.a){
        this.velX -= this.speed;
    }
    
    if(inputFrame.s){
        this.velY += this.speed;
    }
    
    if(inputFrame.d){
        this.velX += this.speed;
    }
    
    if(inputFrame.shoot){
        objects.push(new Bullet(this.x + this.width/4, this.y + this.height/4, this.velX, this.velY));
    }
    
    this.x += this.velX;
    this.y += this.velY;
    
    this.velX *= this.drag;
    this.velY *= this.drag;
};

Multi.targetClass(Bullet);
Multi.defineVar("float", "x", true, 2);
Multi.defineVar("float", "y", true, 2);
function Bullet(x, y, velX, velY){
    this.net = new NetworkedObject(this);
    this.x = x;
    this.y = y;
    this.angle = Math.atan2(velY, velX);
    this.speed = 5;
}

Bullet.prototype.update = function(){
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    
    if(this.x < -100 || this.x > 900 || this.y < -100 || this.y > 700){
        this.net.destroy();
    }
};

Multi.targetClass(Test);
Multi.defineVar("float", "angle", true, 2);
function Test(){
    this.net = new NetworkedObject(this);
    this.angle = 0;
}

Test.prototype.update = function(){
    this.angle += 0.01;
};

setInterval(update, 1000/60);