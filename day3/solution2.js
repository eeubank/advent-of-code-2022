const fs = require('fs');
const fsPromises = fs.promises;

async function readInput() {
    const buffer = await fsPromises.readFile('input.txt');
    return buffer.toString();
}

function calculateDuplicates(input) {
    let total = 0;
    const inputSplit = input.split('\n');

    for(let i = 0; i < inputSplit.length; i += 3) {
        const runsack1 = inputSplit[i].split('');
        const runsack2 = inputSplit[i + 1].split('');
        const runsack3 = inputSplit[i + 2].split('');
        const badgeItem = runsack1
            .filter(item => runsack2.includes(item))
            .filter(item => runsack3.includes(item))[0];
        total += getItemValue(badgeItem);
    }

    return total;
}

function getItemValue(item) {
    if (/^[a-z]*$/.test(item)) {
        return item.charCodeAt() - 96;
    } else {
        return item.charCodeAt() - 38;
    }
}

async function run() {
    const input = await readInput();
    const total = calculateDuplicates(input);
    console.log(total);
}

run();