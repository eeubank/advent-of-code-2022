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
    const sorted = 
        rangeLength(range1) < rangeLength(range2) ?
        {
            smallest: range1,
            largest: range2,
        } :
        {
            smallest: range2,
            largest: range1,
        };

    return sorted.smallest[0] >= sorted.largest[0] && sorted.smallest[1] <= sorted.largest[1];
}

function rangeLength(range) {
    return range[1] - range[0];
}

async function run() {
    const input = await readInput();
    const max = calculateOverlaps(input);
    console.log(max);
}

run();