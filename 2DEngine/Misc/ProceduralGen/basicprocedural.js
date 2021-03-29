function random(){
    return Math.random();
}

function randInt(min, max){
    return Math.floor(Math.random() * (max + 1 - min) + min);
}

/**
 * @summary Returns a 'random'(its not random) number based on input x and y.
 * @param {float} x The x value.
 * @param {float} y The y value.
 * @return {float} The 'random' result (its not random).
**/

function xyToNumber(x, y){
    return Math.pow(Math.sin(x) + Math.cos(y), 2) * (x*x + y*y) % 1;
}