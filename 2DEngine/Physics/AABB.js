/**
 * @summary Creates an aabb.
 * @class
 * @param {float} x The x position.
 * @param {float} y The y position.
 * @param {float} width The width.
 * @param {float} height The height.
**/
function AABB(x, y, width, height){
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
}

/**
 * @summary Checks if two AABBs are colliding.
 * @param {AABB} aabb The object to check collision with.
 * @return {bool} Whether colliding or not.
**/
AABB.prototype.checkCollide = function(aabb){
    return (this.x < aabb.x + aabb.width && this.x + this.width > aabb.x &&
            this.y < aabb.y + aabb.height && this.y + this.height > aabb.y);
};

/**
 * @summary Sets the aabb properties to objects position.
 * @param {Object} obj The obj to set to, must have x, y, width, and height values, unchanged if undefined.
**/
AABB.prototype.setPos = function(obj){
    this.x = obj.x || this.x;
    this.y = obj.y || this.y;
    this.width = obj.width || this.width;
    this.height = obj.height || this.height;
};

function AABBcollide(obj1, obj2){
    return (obj1.x < obj2.x + obj2.width && obj1.x + obj1.width > obj2.x &&
            obj1.y < obj2.y + obj2.height && obj1.y + obj1.height > obj2.y);
}

function AABBcollideVel(obj1, obj2){
    return (obj1.x + obj1.velX < obj2.x + obj2.width + obj2.velX && 
            obj1.x + obj1.width + obj1.velX > obj2.x + obj2.velX &&
            obj1.y + obj1.velY < obj2.y + obj2.height + obj2.velY &&
            obj1.y + obj1.height + obj1.velY > obj2.y + obj2.velY);
}