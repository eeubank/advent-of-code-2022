const fs = require('fs');
const fsPromises = fs.promises;

async function readInput() {
    const buffer = await fsPromises.readFile('input.txt');
    return buffer.toString().split('\n');
}

function getSignalStrength(inputs) {
    let signal = 0;
    let crtOutput = '';
    let nextReading = 20;
    let cycle = 0;
    let programCounter = 0;
    let x = 1;
    let instruction;
    
    while (programCounter < inputs.length) {
        if (++cycle === nextReading) {
            signal += calculateSignalStrength(cycle, x);
            nextReading += 40;
        }

        crtOutput += getPixel(cycle, x);

        if (!instruction) {
            instruction = readInstruction(inputs[programCounter++]);    
        }
        instruction.cyclesRequired--;

        switch (instruction.type) {
            case 'addx':
                if (instruction.cyclesRequired === 0) {
                    x += instruction.value;
                    instruction = undefined;
                }
                break;

            case 'noop':
                instruction = undefined;
                break;
        }
    }

    return { signal, crtOutput };
}

function readInstruction(input) {
    const matches = /(\w*)(?:$| )(.*)/.exec(input);
    
    const type = matches[1];
    let cyclesRequired = 1;
    if (type === 'addx') {
        cyclesRequired = 2;
    }
    const value = Number.parseInt(matches[2]);

    return {
        type,
        value,
        cyclesRequired,
    };
}

function calculateSignalStrength(cycle, x) {
    return cycle * x;
}

function getPixel(cycle, x) {
    const position = (cycle - 1) % 40;
    const isVisible = [-1, 0, 1].includes(position - x);
    const isEol = position === 39;

    return `${isVisible ? '#' : '.'}${isEol ? '\n' : ''}`;
}

async function run() {
    const input = await readInput();
    const { signal, crtOutput } = getSignalStrength(input);
    console.log(signal);
    console.log(crtOutput);
}

run();