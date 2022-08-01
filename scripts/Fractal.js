class Fractal {
    constructor(renderWidth, renderHeight) {
        this.renderWidth = renderWidth
        this.renderHeight = renderHeight
        
        this.sb = createGraphics(renderWidth, renderHeight)
        this.aspectRatio = renderHeight/renderWidth

        this.sbX = 0.0
        this.sbY = 0.0
        this.sbWidth = width

        this.moving = false
    }

    get height() {
        return this.width * this.aspectRatio
    }

    get pixelDensity() {
        return this.renderWidth/this.width
    }

    setZoom(x, y, width) {
        this.x = x
        this.y = y
        this.width = width
    }

    setDefaultZoom() {
        let minX = -2.2 // -2
        let maxX = 0.67 //  0.47
        let minY = -1.3 // -1.12
        let maxY = 1.3  //  1.12

        let maxWidth = maxX - minX
        let maxHeight = maxY - minY
        let maxAspectRatio = maxHeight/maxWidth
        if(this.aspectRatio > maxAspectRatio) {
            this.x = minX
            this.width = maxWidth
            // desired center = 0
            // we want y so that y + height / 2 = desired center
            // then
            this.y = -this.height/2
        }
        else {
            this.y = minY
            this.width = maxHeight/this.aspectRatio // same as this.height = this.maxHeight
            // desired center = (minX + maxX) / 2
            // we want x so that x + width / 2 = desired center
            // then
            this.x = (minX + maxX - this.width) / 2
        }
        
    }

    makeSequence(x0,y0) {
        let x = 0.0
        let y = 0.0
        let iteration = 0
        while(x*x + y*y <= maxValueSq && iteration < maxIterations) {
            let xtemp = x*x - y*y + x0
            y = 2*x*y + y0
            x = xtemp

            // let xtemp = x0 + x*x*x - 3 * x * y * y
            // y = y0 + 3 * x * x * y - y * y * y
            // x = xtemp

            iteration++
        }
        return {x, y, iteration}
    }

    setColor(x, y, iteration) {
        if(iteration == maxIterations)
            this.sb.stroke(0)
        else {
            let smoothed = Math.log2(Math.log2(x * x + y * y) / 2);  // log_2(log_2(|p|))
            let colorI = Math.floor(Math.sqrt(iteration + 10 - smoothed) * 256) % colors.length;
            this.sb.stroke(colors[colorI])
        }
    }

    render() {
        for(let xp = 0; xp < this.renderWidth; xp++)
        for(let yp = 0; yp < this.renderHeight; yp++) {
            let x0 = this.x + xp*this.width/this.renderWidth
            let y0 = this.y + yp*this.height/this.renderHeight

            let {x, y, iteration} = this.makeSequence(x0,y0)

            this.setColor(x, y, iteration)
            this.sb.point(xp, yp)
        }
    }
    
    draw() {
        image(this.sb, this.sbX, this.sbY, this.sbWidth, this.sbWidth * this.aspectRatio)

        if(showBorders) {
            stroke(borderColor)
            strokeWeight(sizeUnit)
            noFill()
            rect(this.sbX, this.sbY, this.sbWidth, this.sbWidth * this.aspectRatio)
        }
    }

    setupMove(x, y) {
        this.moveX1 = x - this.sbX
        this.moveY1 = y - this.sbY
        this.moving = true
    }

    stopMove() {
        this.moving = false
    }

    move(x, y) {
        this.sbX = x - this.moveX1
        this.sbY = y - this.moveY1
    }

    scale(s) {
        if(this.moving) return
        this.sbX = mouseX*(1-s) + s*this.sbX
        this.sbY = mouseY*(1-s) + s*this.sbY
        this.sbWidth *= s
    }
}