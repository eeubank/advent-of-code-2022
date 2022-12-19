const fs = require('fs');
const fsPromises = fs.promises;

async function readInput(path) {
    const buffer = await fsPromises.readFile(path);
    return buffer.toString().split('\n');
}

function calculateCorrectPairs(inputs) {
    const correctPairs = [];
    
    for (let i = 0, pairIdx = 1; i < inputs.length; i += 3, pairIdx++) {
        const sorted = sort(parse(inputs[i]), parse(inputs[i + 1]));
        if (sorted < 0) {
            correctPairs.push(pairIdx);
        }
    }

    return correctPairs.reduce((a, v) => a + v, 0);
}

function calculateDecoderKey(inputs) {
    const dividerPacket1 = [[2]];
    const dividerPacket2 = [[6]];

    const parsed = inputs.filter(line => line.length)
        .map(input => parse(input));
    parsed.push(dividerPacket1);
    parsed.push(dividerPacket2);
    parsed.sort(sort);

    return (parsed.indexOf(dividerPacket1) + 1) * (parsed.indexOf(dividerPacket2) + 1);
}

function parse(input) {
    return JSON.parse(input);
}

function sort(left, right) {
    let equality = 0;
    let i = -1;
    while (++i < Math.max(left.length, right.length) && equality === 0) {
        let vLeft = left[i];
        let vRight = right[i];
        
        if (vLeft == null) {
            return -1;
        }
        if (vRight == null) {
            return 1;
        }

        const vLeftIsArr = Array.isArray(vLeft);
        const vRightIsArr = Array.isArray(vRight);

        if (!vLeftIsArr && !vRightIsArr) {
            equality = vLeft - vRight;
        } else {
            vLeft = vLeftIsArr ? vLeft : [vLeft];
            vRight = vRightIsArr ? vRight : [vRight];
            equality = sort(vLeft, vRight);
        }
    }

    return equality;
}

async function run() {
    const input = await readInput('input.txt');
    const correctPairs = calculateCorrectPairs(input);
    console.log('correctPairs', correctPairs);
    const decoderKey = calculateDecoderKey(input);
    console.log('decoderKey', decoderKey);
}

run();