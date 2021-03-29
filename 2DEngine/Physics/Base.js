/*global pkgs use*/

pkgs.add("vector", "Physics/Vector2.js");
pkgs.add("polygon", "Physics/Polygon.js");
pkgs.add("movement", "Physics/Motion.js");
pkgs.add("gravity", "Physics/Gravity.js");
pkgs.add("aabb", "Physics/AABB.js");
//pkgs.add("advPhysics", "Physics/fillthis");

use("vector");
use("polygon");
use("gravity");

function PhysicsEngine(gravity, renderSurface){
    this.gravity = gravity;
    this.renderSurface = renderSurface;
    this.objects = [];
}

PhysicsEngine.prototype.update = function(){
    for(var i in this.objects){
        this.gravity.updateObj(this.objects[i]);
        this.objects[i].update();
    }
};

PhysicsEngine.prototype.drawObjects = function(integration){
    for(var i in this.objects){
        this.objects[i].render(this.renderSurface, integration);
    }
};

PhysicsEngine.prototype.updateArray = function(array){
    
};

PhysicsEngine.prototype.returnArray = function(){
    
};

PhysicsEngine.prototype.addObject = function(obj){
    this.objects.push(obj);
};


function TestCube(x, y, width, height, velX, velY){
    this.x = x || 0;
    this.y = y || 0;
    this.velX = velX || 0;
    this.velY = velY || 0;
    this.width = width || 20;
    this.height = height || 20;
}

TestCube.prototype.update = function(){
    this.x += this.velX;
    this.y += this.velY;
    this.updateCollision();
};

TestCube.prototype.updateCollision = function(){
    
};

TestCube.prototype.render = function(surface, integration){
    surface.fillStyle = "#f00";
    surface.fillRect(this.x + this.velX * integration, this.y + this.velY * integration,
                     this.width, this.height);
};