class Fractal {
    constructor(renderWidth, renderHeight) {
        this.renderWidth = renderWidth
        this.renderHeight = renderHeight
        
        this.sb = createGraphics(renderWidth, renderHeight)
        this.aspectRatio = renderHeight/renderWidth

        this.sbX = 0.0
        this.sbY = 0.0
        this.sbWidth = windowWidth

        this.moving = false
    }

    get height() {
        return this.width * this.aspectRatio
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
        let x = 0
        let y = 0
        let iteration = 0
        while(x*x + y*y <= maxValueSq && iteration < maxIterations) {
            let xtemp = x*x - y*y + x0
            y = 2*x*y + y0
            x = xtemp
            iteration++
        }
        return {x, y, iteration}
    }

    setColor(x, y, iteration) {
        // let hue = 255 * iteration / maxIterations
        // let saturation = 255
        // let brightness = iteration < maxIterations ? 255 : 0

        // this.sb.stroke(hue, saturation, brightness)

        if(iteration == maxIterations)
            this.sb.stroke(0)
        else {
            //iteration += 1 - Math.log(Math.log(x*x + y*y) / (2 * Math.log(2))) / Math.log(2)
            let smoothed = Math.log2(Math.log2(x * x + y * y) / 2);  // log_2(log_2(|p|))
            let colorI = Math.floor(Math.sqrt(iteration + 10 - smoothed) * 256) % colors.length;
            this.sb.stroke(colors[colorI])
        }
    }

    render() {
        // this.width *= windowWidth/this.sbWidth
        // this.x -= this.sbX/windowWidth * this.width
        // this.y -= this.sbY/windowHeight * this.height

        // this.sbX = 0
        // this.sbY = 0
        // this.sbWidth = windowWidth

        // this.sb.colorMode(HSB, 256);

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

var mainFractal
var fractals

var maxIterations = 1000
var maxValueSq = 1 << 16

var resolutionScale = 1

var sizeUnit

var showBorders
var borderAux
var borderColor

var colors

function setup() {
    let cnv = createCanvas(windowWidth, windowHeight)
    cnv.mouseWheel(changeScale);

    initializeColors()

    // background(0)
    // for(let x = 0; x < width; x++) {
    //     strokeWeight(1)
    //     stroke(colors[Math.floor(x/width*2048)])
    //     line(x,0,x,height)
    // }

    mainFractal = new Fractal(windowWidth*resolutionScale, windowHeight*resolutionScale)
    mainFractal.setDefaultZoom()
    mainFractal.render()

    fractals = []
    fractals.push(mainFractal)

    button = createButton('render');
    button.position(0, 0);
    button.mousePressed(newRender);

    sizeUnit = Math.sqrt(windowWidth*windowWidth + windowHeight*windowHeight) / 100

    showBorders = false
    borderAux = 0
    borderColor = color(0)
}

function draw() {
    background(0)
    
    for(i in fractals)
        fractals[i].draw()
    
        updateBorderColor()
}

function newRender() {
    let newWidth = mainFractal.width * windowWidth/mainFractal.sbWidth
    let newX = mainFractal.x - mainFractal.sbX/windowWidth * newWidth
    let newY = mainFractal.y - mainFractal.sbY/windowHeight * newWidth*mainFractal.aspectRatio

    let newF = new Fractal(windowWidth*resolutionScale, windowHeight*resolutionScale)
    newF.setZoom(newX, newY, newWidth)
    newF.render()

    // insert sorted decrescent by width
    let inserted = false
    for(let i = 0; i < fractals.length && !inserted; i++)
    if(newWidth > fractals[i].width) {
        fractals.splice(i, 0, newF);
        inserted = true
    }

    if(!inserted)
        fractals.push(newF)
}

function mousePressed() {
    for(i in fractals)
        fractals[i].setupMove(mouseX, mouseY)
}

function mouseDragged() {
    for(i in fractals)
        fractals[i].move(mouseX, mouseY)
}

function mouseReleased() {
    for(i in fractals)
        fractals[i].stopMove()
}

function changeScale(event) { // mouse Wheel event
    if (event.deltaY < 0) {
        for(i in fractals)
            fractals[i].scale(1.1)

    } else {
        for(i in fractals)
            fractals[i].scale(0.9)
    }
}

function toogleBorders() {
    showBorders = !showBorders
}

function updateBorderColor() {
    borderAux += 0.1
    borderColor = color((Math.sin(borderAux)+1)*255)
}

function windowResized() {
    console.log("não feito")
    // resizeCanvas(windowWidth, windowHeight)
    // mainFractal.sb.remove()
    // mainFractal = new Fractal(windowWidth, windowHeight, false)
}




/*
https://stackoverflow.com/questions/16500656/which-color-gradient-is-used-to-color-mandelbrot-in-wikipedia
Position = 0.0     Color = (  0,   7, 100)
Position = 0.16    Color = ( 32, 107, 203)
Position = 0.42    Color = (237, 255, 255)
Position = 0.6425  Color = (255, 170,   0)
Position = 0.8575  Color = (  0,   2,   0)
*/
function initializeColors() {
    
    // let r = createInterpolant([0.0, 0.16, 0.42, 0.6425, 0.8575], [0, 32, 237, 255, 0]);
    // let g = createInterpolant([0.0, 0.16, 0.42, 0.6425, 0.8575], [7, 107, 255, 170, 2]);
    // let b = createInterpolant([0.0, 0.16, 0.42, 0.6425, 0.8575], [100, 203, 255, 0, 0]);
    
    // for(let i = 0; i < 2048; i++) {
    //     let p = i/2048
    //     let c = color(r(p), g(p), b(p));
    //     colors.push(c)
    // }

    colors = []

    let xs = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]
    let r = createInterpolant(xs, [66, 25, 9, 4, 0, 12, 24, 57, 134, 211, 241, 248, 255, 204, 153, 106]);
    let g = createInterpolant(xs, [30, 7, 1, 4, 7, 44, 82, 125, 181, 236, 233, 201, 170, 128, 87, 52]);
    let b = createInterpolant(xs, [15, 26, 47, 73, 100, 138, 177, 209, 229, 248, 191, 95, 0, 0, 0, 3]);

    for(let i = 0; i < 2048; i++) {
        let p = 15*i/2048
        let c = color(r(p), g(p), b(p));
        colors.push(c)
    }
}






/* Monotone cubic spline interpolation
   Usage example:
	var f = createInterpolant([0, 1, 2, 3, 4], [0, 1, 4, 9, 16]);
	var message = '';
	for (var x = 0; x <= 4; x += 0.5) {
		var xSquared = f(x);
		message += x + ' squared is about ' + xSquared + '\n';
	}
	alert(message);
*/
var createInterpolant = function(xs, ys) {
	var i, length = xs.length;
	
	// Deal with length issues
	if (length != ys.length) { throw 'Need an equal count of xs and ys.'; }
	if (length === 0) { return function(x) { return 0; }; }
	if (length === 1) {
		// Impl: Precomputing the result prevents problems if ys is mutated later and allows garbage collection of ys
		// Impl: Unary plus properly converts values to numbers
		var result = +ys[0];
		return function(x) { return result; };
	}
	
	// Rearrange xs and ys so that xs is sorted
	var indexes = [];
	for (i = 0; i < length; i++) { indexes.push(i); }
	indexes.sort(function(a, b) { return xs[a] < xs[b] ? -1 : 1; });
	var oldXs = xs, oldYs = ys;
	// Impl: Creating new arrays also prevents problems if the input arrays are mutated later
	xs = []; ys = [];
	// Impl: Unary plus properly converts values to numbers
	for (i = 0; i < length; i++) { xs.push(+oldXs[indexes[i]]); ys.push(+oldYs[indexes[i]]); }
	
	// Get consecutive differences and slopes
	var dys = [], dxs = [], ms = [];
	for (i = 0; i < length - 1; i++) {
		var dx = xs[i + 1] - xs[i], dy = ys[i + 1] - ys[i];
		dxs.push(dx); dys.push(dy); ms.push(dy/dx);
	}
	
	// Get degree-1 coefficients
	var c1s = [ms[0]];
	for (i = 0; i < dxs.length - 1; i++) {
		var m = ms[i], mNext = ms[i + 1];
		if (m*mNext <= 0) {
			c1s.push(0);
		} else {
			var dx_ = dxs[i], dxNext = dxs[i + 1], common = dx_ + dxNext;
			c1s.push(3*common/((common + dxNext)/m + (common + dx_)/mNext));
		}
	}
	c1s.push(ms[ms.length - 1]);
	
	// Get degree-2 and degree-3 coefficients
	var c2s = [], c3s = [];
	for (i = 0; i < c1s.length - 1; i++) {
		var c1 = c1s[i], m_ = ms[i], invDx = 1/dxs[i], common_ = c1 + c1s[i + 1] - m_ - m_;
		c2s.push((m_ - c1 - common_)*invDx); c3s.push(common_*invDx*invDx);
	}
	
	// Return interpolant function
	return function(x) {
		// The rightmost point in the dataset should give an exact result
		var i = xs.length - 1;
		if (x == xs[i]) { return ys[i]; }
		
		// Search for the interval x is in, returning the corresponding y if x is one of the original xs
		var low = 0, mid, high = c3s.length - 1;
		while (low <= high) {
			mid = Math.floor(0.5*(low + high));
			var xHere = xs[mid];
			if (xHere < x) { low = mid + 1; }
			else if (xHere > x) { high = mid - 1; }
			else { return ys[mid]; }
		}
		i = Math.max(0, high);
		
		// Interpolate
		var diff = x - xs[i], diffSq = diff*diff;
		return ys[i] + c1s[i]*diff + c2s[i]*diffSq + c3s[i]*diff*diffSq;
	};
};