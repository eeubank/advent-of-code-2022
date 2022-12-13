const fs = require('fs');
const fsPromises = fs.promises;

function Knot() {
    this.x = 0;
    this.y = 0;
    this.toString = function() {
        return `x:${this.x} y:${this.y}`;
    }
}

async function readInput() {
    const buffer = await fsPromises.readFile('input.txt');
    return buffer.toString().split('\n');
}

function simulateMotions(inputs, numKnots) {
    let knots = Array.from(new Array(numKnots), () => new Knot());
    const tailPostions = new Map();

    tailPostions.set(knots.at(-1).toString(), true);
    for (const input of inputs) {
        //console.log(input);
        for (const move of expandMoves(input)) {
            head = nextHead(knots[0], move);
            for (let i = 0; i < knots.length - 1; i++) {
                knots[i + 1] = nextKnot(knots[i], knots[i + 1]);
            }
            //console.log(knots.map(k => k.toString()));
            tailPostions.set(knots.at(-1).toString(), true);
        }
    }

    //console.log(tailPostions);
    return tailPostions.size;
}

function expandMoves(input) {
    const matches = /([RULD]) (\d*)/.exec(input);
    const direction = matches[1];
    const steps = Number.parseInt(matches[2]);
    return new Array(steps).fill(direction);
}

function nextHead(head, direction) {
    switch (direction) {
        case 'R':
            head.x++;
            break;
        case 'L':
            head.x--;
            break;
        case 'U':
            head.y--;
            break;
        case 'D':
            head.y++;
            break;
    }

    return head;
}

function nextKnot(ahead, behind) {
    const xDiff = ahead.x - behind.x;
    const yDiff = ahead.y - behind.y;

    moveDiagnol = Math.abs(xDiff) > 1 && Math.abs(yDiff) > 1;
    
    // R
    if (xDiff > 1) {
        behind.x++;
        behind.y = moveDiagnol ? behind.y : ahead.y;
    }

    // L
    if (xDiff < -1) {
        behind.x--;;
        behind.y = moveDiagnol ? behind.y : ahead.y;
    }

    // U
    if (yDiff < -1) {
        behind.y--;
        behind.x = moveDiagnol ? behind.x : ahead.x;
    }

    // D
    if (yDiff > 1) {
        behind.y++;
        behind.x = moveDiagnol ? behind.x : ahead.x;
    }

    return behind;
}

async function run() {
    const input = await readInput();
    const positions2 = simulateMotions(input, 2);
    console.log(`2 knots: ${positions2}`);
    const positions10 = simulateMotions(input, 10);
    console.log(`10 knots: ${positions10}`);
}

run();