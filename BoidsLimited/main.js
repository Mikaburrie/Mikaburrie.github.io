
class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x
        this.y = y
    }

    get mag() {
        return Math.sqrt(this.x*this.x + this.y*this.y)
    }

    get angle() {
        return Math.atan2(this.y, this.x)
    }

    add(val) {
        switch (val.constructor.name) {
            case "Vector2": return new Vector2(this.x + val.x, this.y + val.y)
            case "Number": return new Vector2(this.x + val, this.y + val)
            default: throw new Error(`Invalid argument type: Got ${typeof val}, expected Vector2 or Number`)
        }
    }

    sub(val) {
        switch (val.constructor.name) {
            case "Vector2": return new Vector2(this.x - val.x, this.y - val.y)
            case "Number": return new Vector2(this.x - val, this.y - val)
            default: throw new Error(`Invalid argument type: Got ${typeof val}, expected Vector2 or Number`)
        }
    }

    scale(val) {
        switch (val.constructor.name) {
            case "Vector2": return new Vector2(this.x*val.x, this.y*val.y)
            case "Number": return new Vector2(this.x*val, this.y*val)
            default: throw new Error(`Invalid argument type: Got ${typeof val}, expected Vector2 or Number`)
        }
    }

    dot(val) {
        if (!(val instanceof Vector2)) throw new Error(`Invalid argument type: Got ${typeof val}, expected Vector2`)
        return this.x*val.x + this.y*val.y
    }

    cross(val) {
        if (!(val instanceof Vector2)) throw new Error(`Invalid argument type: Got ${typeof val}, expected Vector2`)
        return this.x*val.y - this.y*val.x
    }
}



class BoidOptions {
    static fov = 360*(Math.PI/180)
    static range = 30
    static frameTime = 100
    static scale = 1
    static radius = 3 * BoidOptions.scale
    static protectedRadius = BoidOptions.radius*4
    static minSpeed = 5
    static maxSpeed = 12
    static separation = 0.75
    static alignment = 0.45
    static cohesion = 0.05
    static boundaryAvoidance = 10
    static boundaryPadding = 15
    static drawRange = false
    static drawBound = false

    static generate(count) {
        return new Array(count).fill(0).map((val, index) => {
            let row = Math.floor(Math.sqrt(0.25 + 2*index) - 0.5)
            let pos = index - row*(row + 1)/2
            return new Boid(-20*row, 10*(pos - row/2), 0.1)
        })
    }
}



class Boid {
    static #pathRobot
    static #pathBound
    static #pathRange
    static {
        this.calculatePaths()
    }

    static calculatePaths() {
        this.#pathRobot = new Path2D()
        this.#pathBound = new Path2D()
        this.#pathRange = new Path2D()
        const {scale, radius, range, fov} = BoidOptions

        // Body wheels, and center line
        let wheelWidth = 1 * scale
        let wheelHeight = 2.5 * scale
        let robotSize = 5 * scale
        this.#pathRobot.rect(-robotSize/2, -robotSize/2, robotSize, robotSize)
        this.#pathRobot.rect(-wheelHeight/2, -wheelWidth - robotSize/2, wheelHeight, wheelWidth)
        this.#pathRobot.rect(-wheelHeight/2, robotSize/2, wheelHeight, wheelWidth)
        this.#pathRobot.moveTo(0, 0);
        this.#pathRobot.lineTo(robotSize/2, 0);
        
        // Bounding circle
        this.#pathBound.arc(0, 0, radius, 0, 2*Math.PI)
        
        // Vision cone
        if (fov < 2*Math.PI) {
            this.#pathRange.moveTo(range*Math.cos(fov/2), range*Math.sin(fov/2))
            this.#pathRange.lineTo(0, 0)
            this.#pathRange.lineTo(range*Math.cos(fov/2), -range*Math.sin(fov/2))
        }
        this.#pathRange.arc(0, 0, range, -fov/2, fov/2)
    }

    constructor(x, y, theta) {
        this.pos = new Vector2(x, y)
        this.vel = new Vector2(2, 0)
        this.accel = new Vector2
    }

    getBoidsInRange(boids) {
        const {radius, range, fov} = BoidOptions
        let theta = this.vel.angle
        let t1 = theta + fov/2
        let t2 = theta - fov/2
        let l1 = new Vector2(Math.cos(t1), Math.sin(t1))
        let l2 = new Vector2(Math.cos(t2), Math.sin(t2))
        
        let inRange = []
        for (const boid of boids) {
            if (boid === this) continue

            let dp = boid.pos.sub(this.pos)
            let inl1 = radius < dp.cross(l1)
            let inl2 = radius < -dp.cross(l2)
            let centerInRange = (fov > Math.PI) ? inl1 || inl2 : inl1 && inl2
            if ((centerInRange || fov >= 2*Math.PI) && dp.dot(dp) < range*range)
                inRange.push(boid)
        }

        return inRange
    }

    static #separationFunc(boid, dp, dist2) {
        return dp.scale(-Number(dist2 < Math.pow(BoidOptions.protectedRadius, 2)))
    }

    static #alignmentFunc(boid, dp, dist2) {
        return boid.vel
    }

    static #cohesionFunc(boid, dp, dist2) {
        return dp
    }

    getBoidMovement(observed, boundary) {
        const b = boundary.sub(BoidOptions.boundaryPadding)
        let boundaryVec = new Vector2(
            0 + (this.pos.x < -b.x) - (this.pos.x > b.x), 
            0 + (this.pos.y < -b.y) - (this.pos.y > b.y))

        if (observed.length === 0) {
            return boundaryVec.scale(10).add(Math.sin(this.vel.x), Math.cos(this.vel.y))
        }

        let sepr = 0
        let align = 0
        let cohere = 0
        let seprVec = new Vector2
        let alignVec = new Vector2
        let cohereVec = new Vector2
        
        for (const boid of observed) {
            let dp = boid.pos.sub(this.pos)
            let dist2 = dp.dot(dp)

            seprVec = seprVec.add(Boid.#separationFunc(boid, dp, dist2))
            sepr++

            alignVec = alignVec.add(Boid.#alignmentFunc(boid, dp, dist2))
            align++

            cohereVec = cohereVec.add(Boid.#cohesionFunc(boid, dp, dist2))
            cohere++
        }

        alignVec = alignVec.scale(1/align)
        cohereVec = cohereVec.scale(1/cohere)

        return seprVec.scale(BoidOptions.separation)
          .add(alignVec.sub(this.vel).scale(BoidOptions.alignment))
          .add(cohereVec.sub(this.pos).scale(BoidOptions.cohesion))
          .add(boundaryVec.scale(BoidOptions.boundaryAvoidance))
    }

    update(boids, boundary) {
        let observed = this.getBoidsInRange(boids)
        let target = this.getBoidMovement(observed, boundary)

        this.accel.x = this.accel.y = 0
        if (target.x !== 0 || target.y !== 0) {
            this.accel = target
        }
    }

    integrate(boundary) {
        const {minSpeed, maxSpeed} = BoidOptions
        this.vel = this.vel.add(this.accel.scale(1/60))
        let speed = this.vel.mag
        if (speed < minSpeed) {
            this.vel = this.vel.scale(minSpeed/speed)
        } else if (speed > maxSpeed) {
            this.vel = this.vel.scale(maxSpeed/speed)
        }
        this.pos = this.pos.add(this.vel.scale(1/60))
    }

    applyCollisions(boids, boundary) {
        const {radius} = BoidOptions
        for (const boid of boids) {
            let dp = boid.pos.sub(this.pos)
            if (dp.dot(dp) > 4*radius*radius || boid === this) continue

            let diff = dp.scale(2*radius/dp.mag - 1)
            boid.pos = boid.pos.add(diff.scale(0.5))
            this.pos = this.pos.sub(diff.scale(0.5))
        }

        if (Math.abs(this.pos.x) > boundary.x - radius)
            this.pos.x = (boundary.x - radius)*Math.sign(this.pos.x)
        if (Math.abs(this.pos.y) > boundary.y - radius)
            this.pos.y = (boundary.y - radius)*Math.sign(this.pos.y)
    }

    draw(ctx) {
        ctx.save()

        ctx.strokeStyle = "#eee"
        ctx.translate(this.pos.x, this.pos.y)
        ctx.rotate(this.vel.angle)
        
        ctx.stroke(Boid.#pathRobot)
        if (BoidOptions.drawBound) ctx.stroke(Boid.#pathBound)
        if (BoidOptions.drawRange) ctx.stroke(Boid.#pathRange)

        ctx.restore()
    }
}



class Boids {
    constructor(count, width, height) {
        this.canvas = document.createElement("canvas")
        this.canvas.width = width
        this.canvas.height = height
        this.canvas.style.backgroundColor = "#222"
        document.body.appendChild(this.canvas)

        this.boids = BoidOptions.generate(count)
    }

    update() {
        let boundary = new Vector2(64, 36)
        for (const boid of this.boids) {
            boid.update(this.boids, boundary)
        }

        for (const boid of this.boids) {
            boid.integrate(boundary)
        }

        for (let i = 0; i < 10; i++) {
            for (const boid of this.boids) {
                boid.applyCollisions(this.boids, boundary)
            }
        }
    }

    draw() {
        const ctx = this.canvas.getContext("2d")
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        ctx.save()

        let scale = 10
        ctx.scale(scale, -scale)
        ctx.translate(this.canvas.width/scale/2, -this.canvas.height/scale/2)
        ctx.lineWidth = 1/scale

        for (const boid of this.boids) {
            boid.draw(ctx)
        }

        ctx.restore()
    }

    run() {
        this.update()
        this.draw()

        requestAnimationFrame(this.run.bind(this))
    }

    static start() {
        let instance = new Boids(5, 1280, 720)
        instance.run()
    }
}

window.onload = Boids.start;