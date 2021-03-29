/**
 * @summary Creates a point at x, y.
 * @class
 * @param {float} x The x pos.
 * @param {float} y The y pos.
**/
function Vector2(x, y){
    this.x = x;
    this.y = y;
}

/**
 * @summary Adds vector vec to the vector.
 * @param {Vector} vec The vector to add.
 * @return {Vector} The result.
**/
Vector2.prototype.add = function(vec){
    return new Vector2(this.x + vec.x, this.y + vec.y);
};

/**
 * @summary Subtracts vector vec from the vector.
 * @param {Vector} vec The vector to subtract.
 * @return {Vector} The result.
**/
Vector2.prototype.sub = function(vec){
    return new Vector2(this.x - vec.x, this.y - vec.y);
};

/**
 * @summary Multiplies vector by vector vec.
 * @param {Vector | float} vec The vector to multiply by.
 * @return {Vector} The result.
**/
Vector2.prototype.mult = function(vec){
    if(vec.constructor.name == "Number"){
        return new Vector2(this.x * vec, this.y * vec);
    }else{
        return new Vector2(this.x * vec.x, this.y * vec.y);
    }
};

/**
 * @summary Divides vector by vector vec.
 * @param {Vector} vec The vector to divide by.
 * @return {Vector} The result.
**/
Vector2.prototype.div = function(vec){
    return new Vector2(this.x / vec.x, this.y / vec.y);
};

/**
 * @summary Scales vector by number num.
 * @param {float} num The number to scale by.
 * @return {Vector} The result.
**/
Vector2.prototype.scale = function(num){
    return new Vector2(this.x * num, this.y * num);
};

/**
 * @summary Rotates the vector around vector vec by deg.
 * @param {Vector} vec The vector to rotate around.
 * @param {float} deg The amount to rotate the vector.
 * @return {Vector} The rotated vector.
**/
Vector2.prototype.rotate = function(vec, deg){
    var x = this.x - vec.x, y = this.y - vec.y;
    return new Vector2(x * Math.cos(deg) - y * Math.sin(deg), y * Math.cos(deg) + x * Math.sin(deg)).add(vec);
};

/**
 * @summary Returns a vector perpendicular to vec.
 * @return {Vector} The perpendicular vector.
**/
Vector2.prototype.perpendicular = function(){
    return new Vector2(-this.y, this.x);
};

/**
 * @summary Finds the dot product of two vectors.
 * @param {Vector} The vector to dot.
 * @return {float} The dot product.
**/
Vector2.prototype.dot = function(vec){
    return (this.x * vec.x + this.y * vec.y);
};

/**
 * @summary Finds the cross product of two vectors.
 * @param {Vector} The vector to cross.
 * @return {float} The cross product.
**/
//Cross product normally returns a vector, but since the vectors are 2d they will return z with x/y being 0.
Vector2.prototype.cross = function(vec){
    return (this.x * vec.y + this.y * vec.x);
};

/**
 * @summary Gets the magnitude of a vector.
 * @return {float} The magnitude of the vector.
**/
Vector2.prototype.magnitude = function(){
    return Math.sqrt(this.x * this.x + this.y * this.y);
};

/**
 * @summary Gets the squared magnitude of a vector.
 * @return {float} The squared magnitude of the vector.
**/
Vector2.prototype.magnitudeSquare = function(){
    return this.x * this.x + this.y * this.y;
};

/**
 * @summary Returns a normalized vector.
 * @return {float} The normalized vector.
**/
Vector2.prototype.normalize = function(){
    return this.scale(1/this.magnitude());
};

/**
 * @summary Gets the direction of a vector.
 * @return {float} The direction of the vector in radians.
**/
Vector2.prototype.direction = function(){
    return Math.atan2(this.y, this.x);
};

/**
 * @summary Rounds the values of the vector
 * @return {Vector} The rounded vector.
**/
Vector2.prototype.round = function(){
    return new Vector2(Math.round(this.x), Math.round(this.y));
};

/**
 * @summary Floors the values of the vector
 * @return {Vector} The floored vector.
**/
Vector2.prototype.floor = function(){
    return new Vector2(Math.floor(this.x), Math.floor(this.y));
};

/**
 * @summary Ceils the values of the vector
 * @return {Vector} The ceiled vector.
**/
Vector2.prototype.ceil = function(){
    return new Vector2(Math.ceil(this.x), Math.ceil(this.y));
};

/**
 * @summary Finds the minimum values for the vectors.
 * @return {Vector} The minimum values of the vectors.
**/
Vector2.prototype.min = function(vec){
    return new Vector2(Math.min(this.x, vec.x), Math.min(this.y, vec.y));
};

/**
 * @summary Finds the maximum values for the vectors.
 * @return {Vector} The maximum values of the vectors.
**/
Vector2.prototype.max = function(vec){
    return new Vector2(Math.max(this.x, vec.x), Math.max(this.y, vec.y));
};

/**
 * @summary Tests if two vectors are equal.
 * @return {Boolean} If equal or not.
**/
Vector2.prototype.equals = function(vec){
    return this.x == vec.x && this.y == vec.y;
};

/**
 * @summary Converts the vector to a string.
 * @return {String} The string format of the vector.
**/
Vector2.prototype.toString = function(){
    return this.x + ", " + this.y;
};
