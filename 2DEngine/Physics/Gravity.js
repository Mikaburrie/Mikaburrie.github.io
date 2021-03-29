/**
 * @summary Creates a gravity point at x, y with strength and radius.
 * @class
 * @param {float} x The gravity point x.
 * @param {float} y The gravity point y.
 * @param {float} radius The radius to effect.
 * @param {float} strength The strength of the point(or mass).
**/
function RadialGravity(x, y, radius, strength){
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.strength = strength;
}

/**
 * @summary Updates an object with the selected gravity point.
 * @param {object} obj The object to update(must have velX and velY properties).
**/
RadialGravity.prototype.updateObj = function(obj){
    var xDist = this.x - obj.x, yDist = this.y - obj.y;
    var distance = Math.sqrt(xDist*xDist + yDist*yDist);
    
    if(distance <= this.radius){
        obj.velX += this.strength/Math.pow(distance, 2) * xDist/distance;
        obj.velY += this.strength/Math.pow(distance, 2) * yDist/distance;
    }
};


/**
 * @summary Creates a LinearGravity object.
 * @class
 * @param {float} xGravity The gravity force on the x.
 * @param {float} yGravity The gravity force on the y.
**/
function LinearGravity(xGravity, yGravity){
    this.xGrav = xGravity;
    this.yGrav = yGravity;
}

/**
 * @summary Updates an object with the gravity.
 * @param {object} obj The object to update(must have velX and velY properties).
**/
LinearGravity.prototype.updateObj = function(obj){
    obj.velX += this.xGrav;
    obj.velY += this.yGrav;
};