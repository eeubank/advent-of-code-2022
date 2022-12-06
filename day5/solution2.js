const fs = require('fs');
const fsPromises = fs.promises;

async function readInput() {
    const stackStateTextArray = [];
    const movesTextArray = [];
    let readingStackState = true;
    
    const buffer = await fsPromises.readFile('input.txt');
    for (const line of buffer.toString().split('\n')) {
        if (line === '') {
            readingStackState = false;
            continue;
        }

        if (readingStackState) {
            stackStateTextArray.push(line);
        } else {
            movesTextArray.push(line);
        }
    };

    return {
        stackStateTextArray,
        movesTextArray,
    };
}

function getStacks(stackStateTextArray) {
    // the last line is numberic stack labels with two spaces between each (i.e. 1  2  3)
    const stackCountText = stackStateTextArray.slice(-1)[0].split('  ');
    // the last number is the number of stacks we need
    const stackCount = Number.parseInt(stackCountText[stackCountText.length - 1]);
    //create a two-diminsional array to represent the stacks
    const stacks = Array.from(Array(stackCount), () => new Array());
    
    // process the text backwards to setup stacks, skip the line processed above
    for (let i = stackStateTextArray.length - 2; i >= 0; i--) {
        const stackStateText = stackStateTextArray[i];
        for (let j = 0; j < stackCount; j++) {
            // stack items start on index 1 and have 4 characters between each
            const stackItem = stackStateText[(j * 4) + 1];
            if (stackItem === ' ') {
                continue;
            }
            stacks[j].push(stackItem);
        }
    }

    return stacks;
}

function processMoves(movesTextArray, stacks) {
    movesTextArray.forEach(moveText => {
        const move = readMoveText(moveText);
        const fromStack = stacks[move.from - 1];
        const items = fromStack.slice(-move.amount);
        fromStack.length = fromStack.length - move.amount;
        stacks[move.to - 1].push(...items);
    });
}

function readMoveText(moveText) {
    const elements = moveText.split(' ');
    return {
        amount: Number.parseInt(elements[1]),
        from: Number.parseInt(elements[3]),
        to: Number.parseInt(elements[5]),
    };
}

function getTopStackItems(stacks) {
    return stacks.map(stack => stack.slice(-1)[0]).join('');
}

async function run() {
    const { stackStateTextArray, movesTextArray } = await readInput();
    const stacks = getStacks(stackStateTextArray);
    processMoves(movesTextArray, stacks);
    const topStackItems = getTopStackItems(stacks);
    console.log(topStackItems);
}

run();