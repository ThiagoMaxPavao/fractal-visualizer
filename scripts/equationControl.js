var changeEquationButton
var setEquationTypeJuliaButton
var setEquationTypeMandelbrotButton
var setPowerInput
var setCRInput
var setCIInput
var confirmButton
var changeEquationState = false

var equationJuliaTemp
var equationPowerTemp
var equationCRTemp
var equationCITemp

function createButtonChangeEquation() {
    equationJuliaTemp = undefined
    equationPowerTemp = undefined
    equationCRTemp = undefined
    equationCITemp = undefined

    changeEquationButton = createButton('Change Equation')
    changeEquationButton.position(0, 300)
    changeEquationButton.size(65)
    changeEquationButton.mousePressed(changeEquationPressedHandler)
}

function changeEquationPressedHandler() {
    if(! changeEquationState) {
        changeEquationState = true

        changeEquationButton.html("Cancel change")

        btn = createButton('Mandelbrot')
        btn.position(0, 350)
        btn.size(100)
        btn.mousePressed(setEquationTypeMandelbrot)
        setEquationTypeMandelbrotButton = btn

        btn = createButton('Julia set');
        btn.position(0, 350 + setEquationTypeMandelbrotButton.height)
        btn.size(100)
        btn.mousePressed(setEquationTypeJulia)
        setEquationTypeJuliaButton = btn
    }
    else
        resetEquationChange()
}

function resetEquationChange() {
    changeEquationState = 0

    if(setEquationTypeMandelbrotButton != undefined)
        setEquationTypeMandelbrotButton.remove()

    if(setEquationTypeJuliaButton != undefined)
        setEquationTypeJuliaButton.remove()

    if(setPowerInput != undefined)
        setPowerInput.remove()

    if(setCRInput != undefined)
        setCRInput.remove()

    if(setCIInput != undefined)
        setCIInput.remove()

    if(confirmButton != undefined)
        confirmButton.remove()

    setEquationTypeMandelbrotButton = undefined
    setEquationTypeJuliaButton = undefined
    setPowerInput = undefined
    setCRInput = undefined
    setCIInput = undefined
    confirmButton = undefined

    changeEquationButton.html("Change Equation")
}

function setEquationTypeJulia() {
    equationJuliaTemp = true
    createParametersInput()
}

function setEquationTypeMandelbrot() {
    equationJuliaTemp = false
    createParametersInput()
}

function createParametersInput() {
    setEquationTypeJuliaButton.remove()
    setEquationTypeMandelbrotButton.remove()

    // Power input
    inp = createInput()
    inp.position(0, 350)
    inp.size(50)
    inp.input(powerSet)
    document.querySelectorAll("input")[document.querySelectorAll("input").length - 1].setAttribute('placeholder', 'Power')
    setPowerInput = inp

    if(equationJuliaTemp) {
        // Re(c) input
        inp = createInput()
        inp.position(0, 350 + setPowerInput.height)
        inp.size(50)
        inp.input(CRSet)
        document.querySelectorAll("input")[document.querySelectorAll("input").length - 1].setAttribute('placeholder', 'Re(c)')
        setCRInput = inp

        // Im(c) input
        inp = createInput()
        inp.position(0, 350 + setPowerInput.height + setCRInput.height)
        inp.size(50)
        inp.input(CISet)
        document.querySelectorAll("input")[document.querySelectorAll("input").length - 1].setAttribute('placeholder', 'Im(c)')
        setCIInput = inp
    }

    // Confirm button
    btn = createButton('Confirm and Restart')
    btn.position(0, 350 + 4 * setPowerInput.height)
    btn.size(100)
    btn.mousePressed(confirmEquation)
    setEquationTypeMandelbrotButton = btn
}

function powerSet() {
    equationPowerTemp = float(this.value())
}

function CRSet() {
    equationCRTemp = float(this.value())
}

function CISet() {
    equationCITemp = float(this.value())
}

function confirmEquation() {
    if(equationPowerTemp == NaN || equationCRTemp == NaN || equationCITemp == NaN) return

    equationJulia = equationJuliaTemp
    equationPower = equationPowerTemp
    equationCR = equationCRTemp
    equationCI = equationCITemp
    
    resetFractal()
    resetEquationChange()
}