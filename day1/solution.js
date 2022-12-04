const fs = require('fs');
const fsPromises = fs.promises;

async function readInput() {
    const buffer = await fsPromises.readFile('input.txt');
    return buffer.toString();
}

function calculateMax(input) {
    let sums = [];
    let acc = 0;

    input
        .split('\n')
        .forEach(s => {
            if (!s.length) {
                sums.push(acc);
                acc = 0;
                return;
            }
            acc += Number.parseInt(s)
        });
    
    sums.sort((a, b) => b - a);
    return sums[0] + sums[1] + sums[2];
}

async function run() {
    const input = await readInput();
    const max = calculateMax(input);
    console.log(max);
}

run();