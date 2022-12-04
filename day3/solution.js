const fs = require('fs');
const fsPromises = fs.promises;

async function readInput() {
    const buffer = await fsPromises.readFile('input.txt');
    return buffer.toString();
}

function calculateDuplicates(input) {
    let total = 0;

    input
        .split('\n')
        .forEach(itemsString => {
            const items = itemsString.split('');
            const runsack1 = items.slice(0, itemsString.length / 2);
            const runsack2 = items.slice(itemsString.length / 2);
            const duplicateItem = runsack1.filter(item => runsack2.includes(item))[0];
            total += getItemValue(duplicateItem);
        });

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