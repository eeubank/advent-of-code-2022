const fs = require('fs');
const fsPromises = fs.promises;

const moveValues = {
    A: {value: 1, beats: 3 },
    B: {value: 2, beats: 1 },
    C: {value: 3, beats: 2 },
    X: {value: 1, beats: 3 },
    Y: {value: 2, beats: 1 },
    Z: {value: 3, beats: 2 },
};
const lose = 0;
const draw = 3;
const win = 6;

async function readInput() {
    const buffer = await fsPromises.readFile('input.txt');
    return buffer.toString();
}

function calculateScore(input) {
    let score = 0;

    input
        .split('\n')
        .forEach(tuple => {
            const round = tuple.split(' ');
            const opponentMove = moveValues[round[0]];
            const myMove = moveValues[round[1]];
            score += calculateRound(opponentMove, myMove);
        });

    return score;
}

function calculateRound(opponentMove, myMove) {
    let score = myMove.value;

    if (opponentMove.value === myMove.value) {
        console.log('draw');
        score +=  draw;
    } else if (opponentMove.beats === myMove.value) {
        console.log('lose');
        score += lose;
    } else {
        console.log('win');
        score +=  win;
    }

    console.log(translate(opponentMove), translate(myMove), score);
    return score;
}

function translate(move) {
    switch (move.value) {
        case 1: return 'R';
        case 2: return 'P';
        case 3: return 'S';
    }
}

async function run() {
    const input = await readInput();
    const score = calculateScore(input);
    console.log(score);
}

run();