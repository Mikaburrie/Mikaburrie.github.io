/**
 * @summary Creates a container for a canvas element and the render context.
 * @class
 * @param {int} width The width of the canvas.
 * @param {int} height The height of the canvas.
 * @param {string} background The background color for the canvas.
**/
function Display(width, height, background, container){
    this.canvasElement = document.createElement("canvas");
    this.canvasElement.width = width;
    this.canvasElement.height = height;
    this.canvasElement.style.backgroundColor = background || "";
    this.container = container || document.body;
    this.container.appendChild(this.canvasElement);
    
    this.canvas = this.canvasElement.getContext("2d");
    this.canvas.width = width; this.canvas.height = height;
    this.canvas.line = function(x1, y1, x2, y2){
        this.fillStyle = this.strokeStyle;
        this.beginPath();
        this.moveTo(x1, y1);
        this.lineTo(x2, y2);
        this.stroke();
    };
    
    this.canvas.clearScreen = function(){
        this.clearRect(0, 0, this.width, this.height);
    };
    
    this.width = width;
    this.height = height;
    this.middleX = width/2;
    this.middleY = height/2;
    this.bitmap.width = this.width;
    this.bitmap.height = this.height;
    this.bitmap.canvasData = this.canvas.getImageData(0, 0, this.width, this.height);
    this.bitmap.data = this.bitmap.canvasData.data;
    this.bitmap.fill = [0, 0, 0, 255];
}

Display.prototype.bitmap = {};

/**
 * @summary Sets the fill of the bitmap to passed in r, g, b, and a.
 * @param {int} r The red color.
 * @param {int} g The green color.
 * @param {int} b The blue color.
 * @param {int} a Optional. The alpha, remains unchanges if not passed.
**/
Display.prototype.bitmap.setFill = function(r, g, b, a){
    this.fill[0] = r;
    this.fill[1] = g;
    this.fill[2] = b;
    if(a !== null){
        this.fill[3] = a;
    }
};

/**
 * @summary Fills a pixel at x, y
 * @param {int} x The x coordinate.
 * @param {int} y The y coordinate.
 * @param {array} fill Optional. The fill for the pixel, defaults to the bitmap fill
**/
Display.prototype.bitmap.fillPixel = function(x, y){
    x = Math.round(x);
    y = Math.round(y);
    if(x > this.width || y > this.height || x < 0 || y < 0){return;}
    let pixel = Math.round((x + y * this.width) * 4);
    this.data[pixel] = this.fill[0];
    this.data[pixel + 1] = this.fill[1];
    this.data[pixel + 2] = this.fill[2];
    this.data[pixel + 3] = this.fill[3];
};

/**
 * @summary Clears the entire screen to transparent black
**/
Display.prototype.bitmap.clearScreen = function(){
    this.data.fill(0);
};

/**
 * @summary Gets canvas data and stores it to the bitmap.
**/
Display.prototype.getPixels = function(){
    this.bitmap.width = this.width;
    this.bitmap.height = this.height;
    this.bitmap.canvasData = this.canvas.getImageData(0, 0, this.width, this.height);
    this.bitmap.data = this.bitmap.canvasData.data;
};

/**
 * @summary Sets canvas to the bitmap data.
**/
Display.prototype.setPixels = function(){
    this.bitmap.canvasData.data = this.bitmap.data;
    this.canvas.putImageData(this.bitmap.canvasData, 0, 0);
};

/**
 * @summary Resizes the display area.
 * @param {int} width The new width.
 * @param {int} height The new height.
**/
Display.prototype.resize = function(width, height){
    let imageSmoothing = this.canvas.imageSmoothingEnabled;
    this.canvasElement.width = width;
    this.canvasElement.height = height;
    this.width = width;
    this.height = height;
    this.middleX = this.width/2;
    this.middleY = this.height/2;
    this.canvas.imageSmoothingEnabled = imageSmoothing;
};

/**
 * @summary Sets the canvas style attribute to value.
 * @param {string} attribute The attribute to change.
 * @param {string} value The to set the attribute to.
**/
Display.prototype.setStyle = function(attribute, value){
    this.canvasElement.style[attribute] = value;
};

/**
 * @summary Sets the image rendering style to style.
 * @param {string} style The style to set it to.
**/
Display.prototype.setRenderStyle = function(style){
    this.canvasElement.style.imageRendering = style;
};

/**
 * @summary Gets the position of the display on the screen and page.
**/
Display.prototype.getPosition = function(){
    //gets the canvas's position on screen for mouse positioning
    this.canvasPosition = this.canvasElement.getBoundingClientRect();
    this.pageX = this.canvasPosition.left;
    this.pageY = this.canvasPosition.top + document.body.scrollTop;
};