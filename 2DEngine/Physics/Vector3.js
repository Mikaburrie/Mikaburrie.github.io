function Vector3(x, y, z){
	this.x = x;
	this.y = y;
	this.z = z;
	this.w = 1;
}

Vector3.prototype.add = function(vec){
	return new Vector3(this.x + vec.x, this.y + vec.y, this.z + vec.z);
};

Vector3.prototype.sub = function(vec){
	return new Vector3(this.x - vec.x, this.y - vec.y, this.z - vec.z);
};

Vector3.prototype.scale = function(num){
	return new Vector3(this.x * num, this.y * num, this.z * num);
};

Vector3.prototype.cross = function(vec){
	return new Vector3(this.y*vec.z - this.z*vec.y, this.z*vec.x - this.x*vec.z, this.x*vec.y - this.y*vec.x);
};

Vector3.prototype.dot = function(vec){
	return this.x*vec.x + this.y*vec.y + this.z*vec.z;
};

Vector3.prototype.rotateY = function(rad){
	return new Vector3(this.x * Math.cos(rad) + this.z * Math.sin(rad), 0, -this.x * Math.sin(rad) + this.z * Math.cos(rad));
};

Vector3.intersects = function(point, normal, start, end){
	normal.normalize();
	let sd = start.dot(normal);
	let t = (normal.dot(point) - sd) / (end.dot(normal) - sd);
	return start.add(end.sub(start).scale(t));
};

Vector3.prototype.getLength = function(){
	return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
};

Vector3.prototype.normalize = function(){
	var l = this.getLength();
	this.x /= l;
	this.y /= l;
	this.z /= l;
	return this;
};