const fs = require('fs');
const fsPromises = fs.promises;

async function readInput() {
    const buffer = await fsPromises.readFile('input.txt');
    return buffer.toString();
}

function calculateOverlaps(input) {
    let overlaps = 0;

    input
        .split('\n')
        .forEach(s => {
            const assignmentRanges = s
                .split(',')
                .map(range => range.split('-'))
                .map(sections => sections.map(section => Number.parseInt(section)));
            overlaps += rangesOverlap(assignmentRanges[0], assignmentRanges[1]) ? 1 : 0;
        });
    
    return overlaps;
}

function rangesOverlap(range1, range2) {
    const rangeArray1 = arrayFromRange(range1);
    const rangeArray2 = arrayFromRange(range2);
    return rangeArray1.some(n => rangeArray2.includes(n));
}

function arrayFromRange(range) {
    return new Array(range[1] - range[0] + 1)
        .fill(0)
        .map((_, idx) => range[0] + idx);
}

async function run() {
    const input = await readInput();
    const max = calculateOverlaps(input);
    console.log(max);
}

run();