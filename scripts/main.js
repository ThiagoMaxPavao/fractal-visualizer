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

var maxIterationsInput
var resolutionScaleInput
var renderButton

var equation = 0

function timedRender() {
    t1 = millis()
    newRender()
    t2 = millis()
    return "time to render: " + ((t2-t1)/1000).toFixed(2) + " s"
}

function setup() {
    let cnv = createCanvas(windowWidth, windowHeight)
    cnv.mouseWheel(changeScale)

    initializeColors()
    createInterface()

    colorShift = 0
    showBorders = false
    borderAux = 0
    borderColor = color(0)

    sizeUnit = Math.sqrt(width*width + height*height) / 300

    mainFractal = new Fractal(width*resolutionScale, height*resolutionScale)
    mainFractal.setDefaultZoom()
    mainFractal.render()

    fractals = []
    fractals.push(mainFractal)

    document.querySelector(".loading").remove()
}

function draw() {
    background(0)
    
    for(i in fractals)
        fractals[i].draw()
    
        updateBorderColor()
}

function currentPosition() {
    let currentWidth = mainFractal.width * width/mainFractal.sbWidth
    let currentX = mainFractal.x - mainFractal.sbX/mainFractal.sbWidth * mainFractal.width
    let currentY = mainFractal.y - (mainFractal.sbY * mainFractal.width)/mainFractal.sbWidth

    return {currentX, currentY, currentWidth}
}

function newRender() {
    if(maxIterations == NaN) {
        maxIterations = 1000
        maxIterationsInput.value(str(maxIterations))
    }
    if(resolutionScale == NaN) {
        resolutionScale = 1.0
        resolutionScaleInput.value(resolutionScale.toFixed(1))
    }

    let newF = new Fractal(width*resolutionScale, height*resolutionScale)
    let {currentX, currentY, currentWidth} = currentPosition()
    newF.setZoom(currentX, currentY, currentWidth)
    newF.render()

    let newPD = newF.pixelDensity

    // insert sorted cresent by pixelDensity
    let inserted = false
    for(let i = 0; i < fractals.length && !inserted; i++)
    if(newPD < fractals[i].pixelDensity) {
        fractals.splice(i, 0, newF)
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
    resizeCanvas(windowWidth, windowHeight)
    sizeUnit = Math.sqrt(width*width + height*height) / 300
}

function initializeColors() {
    // color pallet by https://stackoverflow.com/questions/16500656/which-color-gradient-is-used-to-color-mandelbrot-in-wikipedia
    // interpolated using a Monotone cubic spline interpolation algorithm
    colors = []

    let xs = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]
    let r = createInterpolant(xs, [66, 25, 9, 4, 0, 12, 24, 57, 134, 211, 241, 248, 255, 204, 153, 106])
    let g = createInterpolant(xs, [30, 7, 1, 4, 7, 44, 82, 125, 181, 236, 233, 201, 170, 128, 87, 52])
    let b = createInterpolant(xs, [15, 26, 47, 73, 100, 138, 177, 209, 229, 248, 191, 95, 0, 0, 0, 3])

    for(let i = 0; i < 2048; i++) {
        let p = 15*i/2048
        let c = color(r(p), g(p), b(p))
        colors.push(c)
    }
}

function createInterface() {
    // render
    renderButton = createButton('Render')
    renderButton.position(0, 0)
    renderButton.size(50)
    renderButton.mousePressed(newRender)

    // borders
    button = createButton('Borders')
    button.position(0, 50)
    button.size(50)
    button.mousePressed(toogleBorders)

    // maxIterations
    maxIterationsInput = createInput(str(maxIterations))
    maxIterationsInput.position(0, 100)
    maxIterationsInput.size(50)
    maxIterationsInput.input(maxIterationsSet)

    // resolutionScale
    resolutionScaleInput = createInput(resolutionScale.toFixed(1))
    resolutionScaleInput.position(0, 150)
    resolutionScaleInput.size(50)
    resolutionScaleInput.input(resolutionScaleSet)

    inputs = document.querySelectorAll("input")
    inputs[0].setAttribute('title', 'Maximum of iterations')
    inputs[1].setAttribute('title', 'Resolution multiplier for rendereziation')
}

function maxIterationsSet() {
    maxIterations = int(this.value())
}

function resolutionScaleSet() {
    resolutionScale = float(this.value())
}