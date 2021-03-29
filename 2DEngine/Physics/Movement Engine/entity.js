/* global extend PIXI Keyboard screen world*/
function Entity(x, y, z, velX, velY, velZ){
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
    this.velX = velX || 0;
    this.velY = velY || 0;
    this.velZ = velZ || 0;
    this.height = 1;
    this.width = 1;
    this.gravity = 1;
}

Entity.prototype.update = function(){
    
};

Entity.prototype.render = function(){
    
};

extend(Player, Entity);
function Player(x, y, z, velX, velY, velZ){
    Entity.call(this, x, y, z, velX, velY, velZ);
    
    //Physics
    this.gravity = 0.12;//determines acceleration towards ground
    this.terminalVel = 0;//determines max speed towards ground without vertical input
    this.traction = 0.03;//determines value to decrease velocity by each frame - applies on ground when player makes no input
    this.airTraction = 0.03;//determines value to decrease velocity by each frame - applies in air when player makes no input
    
    //Input velocities
    this.inputVelX = 0;
    this.inputVelY = 0;
    this.inputVelZ = 0;
    
    //Movement - Horizontal:
    this.groundHorizAccel = 0.2;//determines acceleration until reached max speed
    this.groundBaseHorizVel = 2;//base speed the player starts at
    this.groundMaxHorizVel = 6;//max speed the player can achieve on own
    
    this.airHorizAccel = 0.1;//determines acceleration until reached max speed
    this.airBaseHorizVel = 1;//base speed the player starts at
    this.airMaxHorizVel = 6;//max speed the player can achieve on own
    
    //Movement - Vertical:
    this.groundJumpVel = 0;//initial jump
    
    this.airJumpVel = this.gravity * 40;
    this.airFallVel = this.gravity * 80;//max speed towards ground with input
    
    this.airJumpTime = 20;
    this.airJumpedTime = 0;
    this.airFallTime = 0;
    this.airJumpPhase = 0;
    this.airJumpSmooth = 0;
    
    this.jumpRecY = [];
    this.jumpRecVelY = [];
    
    //States
    this.isInvulnerable = false;//player cannot recieve damage, knockback, or hitstun but may recieve hitlag - when shielding
    this.isIntangible = false;//player avoids results of any attack - when dodging
    
    this.hitLag = 0;//player can only make directional influence, player is frozen - after attacked
    this.hitStun = 0;//player can make directional influence or tech(break a fall) - after attacked, lasts after hitlag
    this.tumble = 0;//player still flying but can break out using attack or dodge - after attacked, lasts after hitstun
    
    this.isGrounded = false;//player is on the ground
    
    this.controls = {up: "w", down: "s", left: "a", right: "d", shield: "shift", attack: "spacebar"};
    this.inputQueue = [];//TODO so players can query moves before the current animation has stopped
    
    //Graphics
    this.graphics = new PIXI.Graphics();
    this.graphics.beginFill(0xFFFFFF, 0.5);
    this.graphics.drawRect(this.x - 10, this.y - 10, 20, 20);
    
    this.trail = new PIXI.Graphics();
    this.trail.beginFill(0xFFFFFF, 0.5);
    
    screen.container.addChild(this.graphics);
    //screen.container.addChild(this.trail);
}

Player.prototype.control = function(){
    //input
    if(Keyboard.getKey(this.controls.right)){
        if(this.isGrounded){
            if(this.inputVelX < this.groundBaseHorizVel){//less than base Vel
                this.inputVelX = this.groundBaseHorizVel;
            }else if(this.inputVelX + this.groundHorizAccel < this.groundMaxHorizVel){//less than max Vel
                this.inputVelX += this.groundHorizAccel;
            }
            
            if(this.groundMaxHorizVel < this.inputVelX){//greater than max Vel
                this.inputVelX = this.groundMaxHorizVel;
            }
        }else{
            if(this.inputVelX < this.airBaseHorizVel){//less than base Vel
                this.inputVelX = this.airBaseHorizVel;
            }else if(this.inputVelX + this.airHorizAccel < this.airMaxHorizVel){//less than max Vel
                this.inputVelX += this.airHorizAccel;
            }
            
            if(this.airMaxHorizVel < this.inputVelX){//greater than max Vel
                this.inputVelX = this.airMaxHorizVel;
            }
        }
    }
    if(Keyboard.getKey(this.controls.left)){
        if(this.isGrounded){
            if(-this.inputVelX < this.groundBaseHorizVel){//less than base Vel
                this.inputVelX = -this.groundBaseHorizVel;
            }else if(-(this.inputVelX - this.groundHorizAccel) < this.groundMaxHorizVel){//less than max Vel
                this.inputVelX -= this.groundHorizAccel;
            }
            
            if(this.groundMaxHorizVel < -this.inputVelX){//greater than max Vel
                this.inputVelX = -this.groundMaxHorizVel;
            }
        }else{
            if(-this.inputVelX < this.airBaseHorizVel){//less than base Vel
                this.inputVelX = -this.airBaseHorizVel;
            }else if(-this.inputVelX + this.airHorizAccel < this.airMaxHorizVel){//less than max Vel
                this.inputVelX -= this.airHorizAccel;
            }
            
            if(this.airMaxHorizVel < -this.inputVelX){//greater than max Vel
                this.inputVelX = -this.airMaxHorizVel;
            }
        }
    }
    if(!(Keyboard.getKey(this.controls.right) || Keyboard.getKey(this.controls.left))){
        if(this.isGrounded){
            this.inputVelX *= 1 - this.traction;
        }else{
            this.inputVelX *= 1 - this.airTraction;
        }
    }
    /*Start of Jumping Code*/
    //this.trail.beginFill(0xFFFFFF, 0.5);
    /*
    if(Keyboard.getKey(this.controls.down)){
        this.inputVelY += this.gravity;
        this.airJumpPhase = 0;
        this.airJumpedTime = 0;
    }else if(Keyboard.justPressed(this.controls.up) && this.airJumpPhase == 0){
        if(this.inputVelY > -this.airJumpVel){
            this.inputVelY = -this.airJumpVel - Math.abs(this.inputVelX) / 4;
            this.airJumpedTime = 1;
            this.airJumpPhase = 1;
        }
    }else if(Keyboard.getKey(this.controls.up) && this.airJumpPhase == 1){//the sustained jump
        this.inputVelY -= this.gravity * (1 - (this.airJumpTime - this.airJumpedTime) / this.airJumpTime);//essentially canceling gravity out(we are sorta floating)
        this.airJumpedTime++;//elapse the jumped time
    }else if(this.airJumpPhase == 2){
        if(this.inputVelY >= 0){//reached peak
            this.airJumpPhase = 0;
            this.airJumpedTime = 0;
            //this.trail.beginFill(0xFF0000, 0.5);
        }else{//heading towards peak
            
            this.inputVelY += this.airJumpSmooth * this.airJumpedTime / 80;
            //this.gravity = 0.24;
        }
        this.airJumpedTime++;//elapse the jumped time
    }
    
    if((Keyboard.justReleased(this.controls.up) || (this.airJumpedTime >= this.airJumpTime)) && (this.airJumpPhase == 1)){//if player releases jump key or holds jump key down for too long
        //caps a jump's height / resets the jump
        if(this.airJumpedTime != 0){
            //airJumpSmooth applies additional down direction to make low jumps easier
            this.airJumpSmooth = (this.airJumpTime - this.airJumpedTime) / this.airJumpTime;
            //cap the jump
            //normalize the effect of a fast moving initial speed for low jumps
            this.inputVelY -= this.inputVelY / 2 * this.airJumpSmooth;
        }
        this.airJumpPhase = 2;
        this.airJumpedTime = 0;
    }*/
    
    if(Keyboard.getKey(this.controls.down)){
        this.inputVelY += this.gravity;
        this.airJumpPhase = 0;
        this.airJumpedTime = 0;
    }else if(Keyboard.justPressed(this.controls.up) && this.airJumpPhase == 0){
        if(this.inputVelY > -this.airJumpVel){
            this.isGrounded = false;
            this.groundJumpVel = -this.airJumpVel;// - Math.abs(this.inputVelX) / 4;
            this.airJumpTime += Math.abs(this.inputVelX) * 4;
            this.inputVelY = this.groundJumpVel;
            this.airJumpedTime = 1;
            this.airJumpPhase = 1;
        }
    }else if(Keyboard.getKey(this.controls.up) && this.airJumpPhase == 1){//the sustained jump
        this.inputVelY -= this.gravity * (this.airJumpTime - this.airJumpedTime) / (this.airJumpTime);//essentially canceling gravity out(we are sorta floating)
        this.airJumpedTime++;//elapse the jumped time
    }else if(this.airJumpPhase == 2){
        if(this.inputVelY >= 0){//reached peak
            this.airJumpPhase = 3;
            this.airJumpedTime = 0;
            this.airJumpTime = 20;
            //this.trail.beginFill(0xFF0000, 0.5);
        }else{//heading towards peak
            this.linearDecrease = 1 - (this.airJumpedTime) / (this.airJumpTime * 1.5);
            this.inputVelY += this.gravity * Math.pow(this.linearDecrease * this.airJumpSmooth, 4); //- this.inputVelY / 8 * Math.pow(this.airJumpSmooth, 8); 
            //this.gravity = 0.24;
        }
        this.airJumpedTime++;//elapse the jumped time
    }
    
    if(this.airJumpPhase == 3){ //falling
        if(!this.jumpRecY[this.airFallTime + 2]){
            this.jumpRecY = [];
            this.jumpRecVelY = [];
            this.airJumpPhase = 0;
            this.airFallTime = 0;
        }else{
            this.airFallTime++;
            //this.y = this.jumpRecY[this.airFallTime + 1];
            //this.velY = -this.jumpRecVelY[this.airFallTime] - this.gravity;
        }
    }
    
    if((Keyboard.justReleased(this.controls.up) || (this.airJumpedTime >= this.airJumpTime)) && (this.airJumpPhase == 1)){//if player releases jump key or holds jump key down for too long
        //caps a jump's height / resets the jump
        if(this.airJumpedTime != 0){
            //airJumpSmooth applies additional down direction to make low jumps easier
            if(this.airJumpedTime >= this.airJumpTime){
                this.airJumpSmooth = 0;
            }else{
                this.airJumpSmooth =  1 - this.airJumpedTime / this.airJumpTime; // decreases going up
            }
            
            //cap the jump
            //normalize the effect of a fast moving initial speed for low jumps
            this.inputVelY -= this.inputVelY / 1.5 * Math.pow(this.airJumpSmooth, 4);
        }
        this.airJumpPhase = 2;
        this.airJumpedTime = 0;
    }
    
    /*End of Jumping Code*/
    
    if(Keyboard.justPressed(this.controls.shield)){//shield is put up
        this.isInvulnerable = true;
    }else if(Keyboard.justReleased(this.controls.shield)){//shield is put down
        this.isInvunerable = false;
    }
    if(Keyboard.getKey(this.controls.shield)){//dodging
        this.inputVelY = 0;
        if(Keyboard.justPressed(this.controls.right)){
            this.intangible = true;
            this.inputVelX += 60;
        }else if(Keyboard.justPressed(this.controls.left)){
            this.intangible = true;
            this.inputVelX -= 60;
        }/*else if(Keyboard.justPressed(this.controls.up)){
            this.intangible = true;
            this.inputVelY -= 40;
        }else if(Keyboard.justPressed(this.controls.down)){
            this.intangible = true;
            this.inputVelY += 40;
        }*///vertical dodge disable for now
    }else if(!Keyboard.getKey(this.controls.left) && !Keyboard.getKey(this.controls.right)){//neither right dodge nor left dodge
        
    }
    
    //when hit by an attack
    if(this.hitLag){
        this.inputVelX /= 10;
        this.inputVelY /= 10;
        this.inputVelZ /= 10;
    }else{
        if(this.hitStun){
            
        }else{
            if(this.tumble){
                this.inputVelX = 0;
                this.inputVelY = 0;
                this.inputVelZ = 0;
            }
            
        }
        
    }
};

Player.prototype.update = function(){
    this.control();
    
    /*
    Update physics. While it seems counterintuitive that falling is an input velocity,
    it is necessary since the player "controls" if they fall (jumps, blocking).
    */
    this.inputVelY += this.gravity;
    //terminal velocity
    if(this.inputVelY > this.airFallVel){
        this.inputVelY = this.airFallVel;
    }
    
    //update velocities
    this.x += this.velX + this.inputVelX;
    this.y += this.velY + this.inputVelY;
    this.z += this.velZ + this.inputVelZ;
    
    
    if(!this.grounded && (this.airJumpPhase == 1 || this.airJumpPhase == 2)){
        this.jumpRecY.unshift(this.y);
        this.jumpRecVelY.unshift(this.velY);
    }
};

Player.prototype.physics = function(){
    if(this.y > screen.height){
        this.y = screen.height;
        this.velY = 0;
        this.isGrounded = true;
    }
}

Player.prototype.render = function(){
    this.graphics.x = this.x;
    this.graphics.y = this.y;
    this.trail.drawCircle(this.x, this.y, 4);
}