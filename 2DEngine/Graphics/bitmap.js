/**
 * @deprecated 0.0.0 Use Display class from the display package instead. 
 * @summary Creates a new bitmap object.
 * @class
 * @param {int} width The width of the bitmap.
 * @param {int} height The height of the bitmap.
 * @param {string} background The background color
**/
function Bitmap(width, height, background){
    this.canvasElement = document.createElement("canvas");
    this.canvasElement.width = width;
    this.canvasElement.height = height;
    this.canvasElement.style.backgroundColor = background || "";
    document.body.appendChild(this.canvasElement);
    this.canvas = this.canvasElement.getContext("2d");
    
    this.width = width;
    this.height = height;
    this.canvasData = this.canvas.createImageData(this.width, this.height);
    this.data = this.canvasData.data;
    this.fill = [0, 0, 0, 255];
    this.lineWidth = 1;
    this.fillStyle = "#000";
    this.fillPrev = this.fillStyle;
    
    this.scanBuffer = new Array(this.height * 3);
}

/**
 * @summary Sets the fill of the bitmap to the fillStyle value.
**/
Bitmap.prototype.preFill = function(){
    if(this.fillStyle == this.fillPrev){
        return;
    }
    
    var fill = this.fillStyle;
    if(fill.indexOf("#") == 0){
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        fill = fill.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, function(m, r, g, b){
            return r + r + g + g + b + b;
        });
    
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fill);
        this.setFill(parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16), this.fill[3]);
    }else if(fill.indexOf("rgba(") == 0){
        result = fill.split("(")[1].split(")")[0].split(",").map(function(num){return parseInt(num, 10);});
        this.setFill(result[0], result[1], result[2], result[3] || this.fill[3]);
    }else{
        console.warn("Invalid Fill: FillStyle is not properly formatted.");
        return;
    }
    this.fillPrev = this.fillStyle;
};

/**
 * @summary Sets the fill of the bitmap to passed in r, g, b, and a.
 * @param {int} r The red color.
 * @param {int} g The green color.
 * @param {int} b The blue color.
 * @param {int} a Optional. The alpha, remains unchanges if not passed.
**/
Bitmap.prototype.setFill = function(r, g, b, a){
    if(b == undefined){ //if blue not provided(includes (), (r), and (r, g))
        console.warn("Not enough parameters passed to setFill.");
        return;
    }
    this.fill = [r, g, b, a || this.fill[3]];
    this.fillStyle = "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
};

/**
 * @summary Sets the red color to r.
 * @param {int} r The red color.
**/
Bitmap.prototype.setRed = function(r){
    this.setFill(r, this.fill[1], this.fill[2], this.fill[3]);
};

/**
 * @summary Sets the green color to g.
 * @param {int} g The green color.
**/
Bitmap.prototype.setGreen = function(g){
    this.setFill(this.fill[0], g, this.fill[2], this.fill[3]);
};

/**
 * @summary Sets the blue color to b.
 * @param {int} b The blue color.
**/
Bitmap.prototype.setBlue = function(b){
    this.setFill(this.fill[0], this.fill[1], b, this.fill[3]);
};

/**
 * @summary Sets the alpha to a.
 * @param {int} a The alpha.
**/
Bitmap.prototype.setAlpha = function(a){
    this.setFill(this.fill[0], this.fill[1], this.fill[2], a);
};

/**
 * @summary Fills a rectangle at x, y, width, height
 * @param {int} x The x coordinate.
 * @param {int} y The y coordinate.
 * @param {int} width The width.
 * @param {int} height The height.
**/
Bitmap.prototype.fillRect = function(x, y, width, height){
    if(x > this.width || y > this.height || x + width < 0 || y + height < 0){return;}
    for(var j = Math.round(y); j < Math.round(y + width); j++){
        this.drawScanBuffer(j, Math.round(x), Math.round(x + width));
    }
    this.fillShape(Math.round(y), j);
};

/**
 * @summary Fills line from x1, y1 to x2, y2.
 * @param {int|float} x1 The x of the first point.
 * @param {int|float} y1 The y of the first point.
 * @param {int|float} x2 The x of the second point.
 * @param {int|float} y2 The y of the second point.
**/
Bitmap.prototype.fillLine = function(x1, y1, x2, y2){
    x1 = Math.round(x1);
    x2 = Math.round(x2);
    y1 = Math.round(y1);
    y2 = Math.round(y2);
    
    let m = (y1 - y2)/(x1 - x2); //slope
    
    if(Math.abs(m) > 1){
        let m = (x1 - x2)/(y1 - y2); //invert slope
        let b = x1 - m * y1; //y intercept
        
        if(y1 > y2){ //switches positions if y1 is greater than y2
            let temp = y2;
            y2 = y1;
            y1 = temp;
            
            temp = x2;
            x2 = x1;
            x1 = temp;
        }
        
        for(var j = y1; j < y2; j++){ //loops
            var i = Math.round(m * j + b); //calcs x
            this.fillPixel(i, j); //draws at x, y
        }
    }else{
        if(x1 > x2){ //switches positions if x1 is greater than x2
            let temp = x2;
            x2 = x1;
            x1 = temp;
            
            temp = y2;
            y2 = y1;
            y1 = temp;
        }
        
        let b = y1 - m * x1; //y intercept
        
        for(i = x1; i < x2; i++){ //loops
            j = Math.round(m * i + b); //calcs y
            this.fillPixel(i, j); //draws at x, y
        }
    }
};

/**
 * @summary Fills text at specified location.
 * @param {String} text The text to fill.
 * @param {float} x The x coord.
 * @param {float} y The y coord.
 * @param {int} size Optional. The text size.
 * @param {float} maxWidth Optional. The max width.
**/
Bitmap.prototype.fillText = function(text, x, y, size, maxWidth){
    this.canvas.fillStyle = this.fillStyle;
    this.canvas.font = (size !== undefined ? Math.round(size) + "px Arial" : this.canvas.font);
    this.canvas.fillText(text, x, y, maxWidth);
};

/**
 * @summary Fills a pixel at x, y
 * @param {int} x The x coordinate.
 * @param {int} y The y coordinate.
 * @param {array} fill Optional. The fill for the pixel, defaults to the bitmap fill
**/
Bitmap.prototype.fillPixel = function(x, y, fill){
    if(x > this.width || y > this.height || x < 0 || y < 0){return;}
    this.preFill();
    fill = fill || this.fill;
    let pixel = Math.round((x + y * this.width) * 4);
    this.data[pixel] = fill[0];
    this.data[pixel + 1] = fill[1];
    this.data[pixel + 2] = fill[2];
    this.data[pixel + 3] = fill[3];
};

/**
 * @summary Clears the entire screen to transparent black
**/
Bitmap.prototype.clearScreen = function(){
    this.data.fill(0);
};

/**
 * @summary Clears the specified area
 * @param {int} x The x coordinate.
 * @param {int} y The y coordinate.
 * @param {int} width The width to clear.
 * @param {int} height The height to clear.
**/
Bitmap.prototype.clearRect = function(x, y, width, height){
    if(x > this.width || y > this.height || x + width < 0 || y + height < 0){return;}
    for(var j = Math.round(y); j < Math.round(y + height); j++){
        this.drawScanBuffer(j, Math.round(x), Math.round(x + width), [0, 0, 0, 0]);
    }
    this.fillShape(Math.round(y), j);
};

/**
 * @summary Transfers all changes to the canvas
**/
Bitmap.prototype.draw = function(){
    this.canvasData.data = this.data;
    this.canvas.putImageData(this.canvasData, 0, 0);
};

/**
 * @summary Adds to scan buffer
 * @param {int} yCoord The y coordiante to add to.
 * @param {int} xMin The start x.
 * @param {int} xMax The end x.
 * @param {array} fill Optional. Fill for the buffer.
**/
Bitmap.prototype.drawScanBuffer = function(yCoord, xMin, xMax, fill){
    this.preFill();
    this.scanBuffer[yCoord * 3] = xMin;
    this.scanBuffer[yCoord * 3 + 1] = xMax;
    this.scanBuffer[yCoord * 3 + 2] = fill || this.fill;
};

/**
 * @summary Fills the canvas with the scan buffer
 * @param {int} yMin The start y.
 * @param {int} yMax The end y.
**/
Bitmap.prototype.fillShape = function(yMin, yMax){
    for(var j = Math.round(yMin); j < Math.round(yMax); j++){
        let xMin = this.scanBuffer[j * 3];
        let xMax = this.scanBuffer[j * 3 + 1];
        let fill = this.scanBuffer[j * 3 + 2];
        for(var i = Math.round(xMin); i < Math.round(xMax); i++){
            this.fillPixel(i, j, fill);
        }
    }
};

/**
 * @summary Sets the bitmap dimensions to specified width and height while clearing the bitmap(Optional).
 * @param {int} width The new bitmap width.
 * @param {int} height The new bitmap height.
 * @param {bool} clear Optional. Clears the screen.
**/
Bitmap.prototype.setDimensions = function(width, height, clear){
    this.width = width;
    this.height = height;
    this.canvasElement.width = width;
    this.canvasElement.height = height;
    this.data.length = width * height * 4;
    this.canvasData.data = this.data;
    this.canvasData.width = width;
    this.canvasData.height = height;
    if(clear){
        this.clearScreen();
    }
};

/**
 * @summary Call once to start the time, call again to end the time.
 * @return {int} Returns time in miliseconds.
**/
Bitmap.prototype.time = function(){
    if(this.startTime == undefined){
        this.startTime = Date.now();
    }else{
        let date = Date.now();
        let time = this.startTime;
        console.log(date - time);
        delete this.startTime;
        return (date - time);
    }
};