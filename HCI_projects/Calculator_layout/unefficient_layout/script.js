document.addEventListener('DOMContentLoaded', () => {

    // gets all <p> elements in class box
    const buttons = document.querySelectorAll('.box p');

    //DOM elements
    const barID = document.getElementById("barID");
    const blockID = document.getElementById("blockID");
    const calcCountDisplay = document.getElementById("calc-count");
    
    // predefined variables
    let previousTime = null;
    let previousKey = null;
    const keyPositions = {};
    let results = [];
    let calculationCount = 0;
    let preComma1, preComma2;
    let postFirstComma1, postSecondComma1;
    let postFirstComma2, postSecondComma2;
    let pre1 = false, pre2 = false;
    let temp1, temp2;
    let dot;
    let middle1 = false, middle2 = false;
    let post1 = false, post2 = false;
    let firstNumberOnScreen = false;
    let secondNumberOnScreen = false;
    let equalOnScreen = false;
    let mult1 = false;
    let subterm;
    let number1, number2;
    let sum;
    let result;
    let starter = true;
    let condition1, condition2, condition3, condition4, condition5, condition6, condition7, condition8, condition9, condition10;

    // update screen counter
    function updateCalcCountDisplay() {
        calcCountDisplay.textContent = `Count: ${calculationCount}`;
    }

    // Position of the buttons (pixel)
    buttons.forEach(key => {
        const rect = key.getBoundingClientRect();
        keyPositions[key.dataset.value] = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            width: rect.width
        };
    });

    // Calculate distance between two points
    function calculateDistance(pos1, pos2) {
        return Math.sqrt((pos1.x - pos2.x) ** 2 + (pos1.y - pos2.y) ** 2);
    }

    // Calculate Index of Difficulty (ID)
    function calculateID(D, W) {
        if(D === 0){
            return -1;  // case: log(0) is undefined, so set it to -1
        }else{
            return Math.log2(2 * D / W);
        }
    }

    // Calculate Movement Time (MT)
    function calculateMT(startTime, endTime) {
        return endTime - startTime;
    }

    // Save results to file
    function saveResultsToFile() {
        let textContent = '';
    
        // Add structure to the '.txt'-file
        results.forEach((result, index) => {
            textContent += result;
            if (index < results.length - 1) {
                textContent += '\n';
            }
        });
    
        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'unefficient_layout.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    

    // Handle button click
    function handleButtonClick(value) {
        const currentTime = new Date().getTime();
        // Define conditions. These are reused in updateCalculatorDisplay()
        condition1 = ((value == preComma1) && !pre1);
        condition2 = (pre1 && (value == dot) && !middle1);
        condition3 = (middle1 && (value == postFirstComma1) && !post1);
        condition4 = (post1 && (value == postSecondComma1) && !firstNumberOnScreen);
        condition5 = (firstNumberOnScreen && !pre2 && !mult1 && (value == '*'));
        condition6 = (firstNumberOnScreen && !pre2 && (value == preComma2) && mult1);
        condition7 = (pre2 && (value == dot) && !middle2);
        condition8 = (middle2 && (value == postFirstComma2) && !post2);
        condition9 = (post2 && (value == postSecondComma2) && !secondNumberOnScreen);
        condition10 = (secondNumberOnScreen && (value == '=') && !equalOnScreen);

        // Check if any condition is true. If not we ignore the button click
        if (condition1||condition2||condition3||condition4||condition5||condition6||condition7||
        condition8||condition9||condition10){
        
            if (previousTime !== null && previousKey !== null) {
                const D = calculateDistance(keyPositions[previousKey], keyPositions[value]);
                const W = keyPositions[value].width;
                const ID = calculateID(D, W);
                const MT = calculateMT(previousTime, currentTime);

                const result = `Taste: ${value}, ID: ${ID.toFixed(2)}, MT: ${MT} ms`;
                results.push(result);

                console.log(result);
            }
        }
        previousTime = currentTime;
        previousKey = value;

        // Shows the correct pressed buttons on screen
        updateCalculatorDisplay(value);
    }

    // Updates display based on pressed buttons
    function updateCalculatorDisplay(value) {
        console.log('Button clicked: ' + value);
        // the specific conditions can be found in handleButtonClick()
        if (condition1) {
            temp1 = barID.textContent = value;
            pre1 = true;
        } else if (condition2) {
            temp1 = barID.textContent = temp1 + value;
            middle1 = true;
        } else if (condition3) {
            temp1 = barID.textContent = temp1 + value;
            post1 = true;
        } else if (condition4) {
            number1 = barID.textContent = temp1 + value;
            firstNumberOnScreen = true;
        } else if (condition5) {
            subterm = barID.textContent = number1 + ' * ';
            mult1 = true;
        } else if (condition6) {
            temp2 = barID.textContent = subterm + value;
            number2 = value;
            pre2 = true;
        } else if (condition7) {
            temp2 = barID.textContent = temp2 + value;
            number2 = number2 + value;
            middle2 = true;
        } else if (condition8) {
            temp2 = barID.textContent = temp2 + value;
            number2 = number2 + value;
            post2 = true;
        } else if (condition9) {
            sum = barID.textContent = temp2 + value;
            number2 = number2 + value;
            secondNumberOnScreen = true;
        } else if (condition10) {
            sum = barID.textContent = sum + ' = ';
            equalOnScreen = true;
            calculate(number1, number2);
            barID.textContent = sum + result;
            setTimeout(() => {
                barID.textContent = '';
                calculationCount++;
                updateCalcCountDisplay();

                if (calculationCount >= 20) {
                    saveResultsToFile();
                    results = [];
                    calculationCount = 0;
                    updateCalcCountDisplay();
                }
                generateTerm();
                resetFlags();
                
            }, 2000);
        }
    }

    buttons.forEach(button => {
        button.addEventListener('click', (event) => {
            handleButtonClick(event.target.dataset.value);
        });
    });

    function generateTerm() {
        // generate first multiplier
        preComma1 = Math.floor(Math.random() * 10);
        dot = '.';
        postFirstComma1 = Math.floor(Math.random() * 10);
        postSecondComma1 = Math.floor(Math.random() * 10);
        const multiplier1 = `${preComma1}${dot}${postFirstComma1}${postSecondComma1}`;

        // generate second multiplier
        preComma2 = Math.floor(Math.random() * 10);
        postFirstComma2 = Math.floor(Math.random() * 10);
        postSecondComma2 = Math.floor(Math.random() * 10);
        const multiplier2 = `${preComma2}${dot}${postFirstComma2}${postSecondComma2}`;

        // Display on screen what the user should calculate
        const term = `${multiplier1} * ${multiplier2}`;
        blockID.textContent = term;
    }

    function calculate() {
        result = (number1 * number2).toFixed(4);
    }

    // reset to initial state
    function resetFlags() {
        pre1 = pre2 = false;
        middle1 = middle2 = false;
        post1 = post2 = false;
        firstNumberOnScreen = secondNumberOnScreen = false;
        equalOnScreen = false;
        mult1 = false;
        temp1 = temp2 = '';
        number1 = number2 = '';
        subterm = sum = '';
    }

    if(starter){
        generateTerm();
        starter = false;
    }
});