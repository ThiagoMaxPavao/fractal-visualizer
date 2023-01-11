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
        let minX, minY, maxX, maxY
        if(!equationJulia && equationPower == 2) {
            minX = -2.2 // -2
            maxX = 0.67 //  0.47
            minY = -1.3 // -1.12
            maxY = 1.3  //  1.12
        }
        else {
            minX = -2
            maxX =  2
            minY = -1.4
            maxY =  1.4
        }

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

    complexToPower(a, b, m) {
        let rm = Math.pow(a*a + b*b, m/2)
        let tetam = m*Math.atan2(b, a)
        a = rm * Math.cos(tetam)
        b = rm * Math.sin(tetam)
        return {a, b}
    }

    makeSequence(x0,y0) {
        let x = x0
        let y = y0
        let iteration = 0

        if(equationJulia) {
            x0 = equationCR
            y0 = equationCI
        }

        if(equationPower == 2)
            while(x*x + y*y <= maxValueSq && iteration < maxIterations) {
                let xtemp = x*x - y*y + x0
                y = 2*x*y + y0
                x = xtemp
                
                iteration++
            }
        else if(equationPower == 3)
            while(x*x + y*y <= maxValueSq && iteration < maxIterations) {
                let xtemp = x*x*x - 3 * x * y * y + x0
                y =  3 * x * x * y - y * y * y + y0
                x = xtemp

                iteration++
            }
        else
            while(x*x + y*y <= maxValueSq && iteration < maxIterations) {
                let z = this.complexToPower(x, y, equationPower)
                x = z.a + x0
                y = z.b + y0
                if(x == NaN || y == NaN || x == Infinity || y == Infinity) break
                
                iteration++
            }
        
        return {x, y, iteration}
    }

    logN (x, n) {
        return (Math.log(x) / Math.log(n))
    }

    getColor(x, y, iteration) {
        if(iteration == maxIterations)
            return color(0)
        else {
            let smoothed = this.logN(this.logN(x * x + y * y, equationPower) / 2, equationPower);  // log_2(log_2(|p|))
            let colorI = Math.floor(Math.sqrt(iteration + 10 - smoothed) * 256)% colors.length;
            return colors[colorI]
        }
    }

    render() {
        this.sb.loadPixels()
        for(let xp = 0; xp < this.renderWidth; xp++) 
        for(let yp = 0; yp < this.renderHeight; yp++) {
            let x0 = this.x + xp*this.width/this.renderWidth
            let y0 = this.y + yp*this.height/this.renderHeight

            let {x, y, iteration} = this.makeSequence(x0,y0)
            if(x == NaN || y == NaN || x == Infinity || y == Infinity) continue

            let c = this.getColor(x, y, iteration)
            
            // change color of pixel in (xp, yp) to c, considering pixelDensity
            let d = this.sb.pixelDensity();
            for (let i = 0; i < d; i++)
            for (let j = 0; j < d; j++) {
                let index = 4 * ((yp * d + j) * this.renderWidth * d + (xp * d + i))
                this.sb.pixels[index] = red(c)
                this.sb.pixels[index+1] = green(c)
                this.sb.pixels[index+2] = blue(c)
                this.sb.pixels[index+3] = 255
            }
        }
        this.sb.updatePixels()
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