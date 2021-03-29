/* global Image */
if(!Image){ //if the image object is nonexistant for some unknown reason
    console.warn("Browser does not support the Image object for some reason.");
}

/**
 * @summary Contains image location data for cropping part of an image.
 * @class
 * @param {string} imageName The file name for the image.
 * @param {int} x The x position of the image in the file.
 * @param {int} y The y position of the image in the file.
 * @param {int} width The width of the image in the file.
 * @param {int} height The height of the image in the file.
 * @param {float} originX Optional. The origin x of the image.
 * @param {float} originY Optional. the origin y of the image.
**/
function ImagePos(imageName, x, y, width, height, originX, originY){
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.originX = originX || 0;
    this.originY = originY || 0;
    this.loc = new Image();
    this.loc.src = imageName;
}

/**
 * @summary The object that handels the images.
**/
var ImageHandeler = {
    groups: {image:{}},
    loaded: 0,
    total: 0,
    loadingDir: "",
    startTime: 0,
    loadTime: 0,
    printLoadTime: true,
    img: null,
    drawSurface: null
};

/**
 * @summary Sets the loading directory for the images.
 * @param {string} dir The directory of which to load from.
**/
ImageHandeler.setLoadingDir = function(dir){
    this.loadingDir = dir;
};

/**
 * @summary Adds a new image group to the handeler.
 * @param {string} groupName The name for the group to be created.
**/
ImageHandeler.addGroup = function(groupName){
    this.groups[groupName] = {};
};

/**
 * @summary Adds a new image to the handeler.
 * @param {string} groupName The name of the group of which to store the image.
 * @param {string} imageName The name of the location in the group of which to store it.
 * @param {string} file The name of the image file.
 * @param {int} x The x position of the image in the file.
 * @param {int} y The y position of the image in the file.
 * @param {int} width The width of the image in the file.
 * @param {int} height The height of the image in the file.
 * @param {float} originX Optional. The x origin for the image.
 * @param {float} originY Optional. The y origin for the image.
**/
ImageHandeler.addImage = function(groupName, imageName, file, x, y, width, height, originX, originY){
    this.startTime = this.startTime || Date.now();
    this.groups[groupName || "image"][imageName] = new ImagePos(this.loadingDir + file, x, y, width, height, originX || 0, originY || 0);
    this.groups[groupName || "image"][imageName].loc.addEventListener("load", this.imageLoaded);
    this.total++;
};

/**
 * @summary Returns the image at specified group.
 * @param {string} groupName The name of the group.
 * @param {string} imageName The name of the image in the group.
 * @return {ImagePos} Returns the image position data.
**/
ImageHandeler.getImage = function(groupName, imageName){
    return this.groups[groupName][imageName];
};

/**
 * @summary Loops through a spritesheet and adds images to specified group.
 * @param {string} groupName The name of the group of which to store the image.
 * @param {string} imageName The name of the location in the group of which to store it.
 * @param {string} file The name of the image file.
 * @param {int} rows The number of rows in the spritesheet.
 * @param {int} columns The number of columns in the spritesheet.
 * @param {int} imageWidth The width of the image in the file.
 * @param {int} imageHeight The height of the image in the file.
 * @param {float} originX Optional. The x origin for the images.
 * @param {float} originY Optional. The y origin for the images.
**/
ImageHandeler.addSpritesheet = function(groupName, imageName, file, rows, columns, imageWidth, imageHeight, originX, originY){
    
};

/**
 * @summary Loops through a spritesheet and adds images to specified group from a row.
 * @param {string} groupName The name of the group of which to store the image.
 * @param {string} imageName The name of the location in the group of which to store it.
 * @param {string} file The name of the image file.
 * @param {int} rowLength The length of the row in the spritesheet.
 * @param {int} y The y position in the spritesheet.
 * @param {int} imageWidth The width of the image in the file.
 * @param {int} imageHeight The height of the image in the file.
 * @param {float} originX Optional. The x origin for the images.
 * @param {float} originY Optional. The y origin for the images.
**/
ImageHandeler.addSpritesheetRow = function(groupName, imageName, file, rowLength, y, imageWidth, imageHeight, originX, originY){
    for(var i = 0; i < rowLength; i++){
        this.addImage(groupName, imageName + i, file, imageWidth * i + i, y, imageWidth, imageHeight, originX, originY);
    }
};

/**
 * @summary Checks to see if the images loaded.
 * @return {boolean} Returns whether the images have loaded or not.
**/
ImageHandeler.checkImagesLoaded = function(){
    if(this.total == this.loaded){
        this.startTime = this.startTime || Date.now(); //if start time is 0
        this.loadTime += (Date.now() - this.startTime);
        this.startTime = 0;
        if(this.printLoadTime){console.log("Loaded " + this.loaded + " Images in " + this.loadTime + "ms");}
        this.onimagesloaded();
        return true;
    }
    return false;
};

/**
 * @summary Called when an image loads.
**/
ImageHandeler.imageLoaded = function(){
    ImageHandeler.loaded++;
    ImageHandeler.checkImagesLoaded();
};

/**
 * @summary Called when all images have loaded.
 * @listens ImageHandeler:onimagesloaded
**/
ImageHandeler.onimagesloaded = function(){};

/**
 * @summary Sets onload to passed function.
 * @param {function} func The function to run onload.
**/
ImageHandeler.setOnload = function(func){
    this.onimagesloaded = func;
};

/**
 * @summary Sets the drawing surface for the image handeler.
 * @param {CanvasRenderingContext2D | Display} surface The canvas for the handeler.
**/
ImageHandeler.setDrawSurface = function(surface){
    if(surface.constructor.name == "Display"){
        this.drawSurface = surface.canvas;
    }else if(surface.constructor.name == "CanvasRenderingContext2D"){
        this.drawSurface = surface;
    }else{
        console.error("Invalid Surface: Surface input is not type Display or CanvasRenderingContext2D");
    }
};

/**
 * @summary Draws the specified image at specified points.
 * @param {string} groupName The name of the group of which to store the image.
 * @param {string} imageName The name of the location in the group of which to store it.
 * @param {float} x The x position to draw the image.
 * @param {float} y The y position to draw the image.
 * @param {float} width The width for the drawn image.
 * @param {float} height The height for the drawn image.
**/
ImageHandeler.drawImage = function(groupName, imageName, x, y, width, height){
    this.img = this.getImage(groupName, imageName);
    let ratioW = width/this.img.width, ratioH = height/this.img.height;
    this.drawSurface.drawImage(this.img.loc, this.img.x, this.img.y, this.img.width, this.img.height,
                               x - this.img.originX * ratioW, y - this.img.originY * ratioH, width, height);
};