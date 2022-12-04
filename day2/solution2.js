const fs = require('fs');
const fsPromises = fs.promises;

const moveValues = {
    A: { value: 0, beats: 2 },
    B: { value: 1, beats: 0 },
    C: { value: 2, beats: 1 },
}

const lose = 0;
const draw = 3;
const win = 6;

const outcomeValues = {
    X: { value: lose, offset: -1 },
    Y: { value: draw, offset: 0 },
    Z: { value: win, offset: 1 },
}

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
            const desiredOutcome = outcomeValues[round[1]];
            const myMove = calculateMyMove(opponentMove, desiredOutcome);
            score += calculateRound(opponentMove, myMove);
        });

    return score;
}

function calculateMyMove(opponentMove, desiredOutcome) {
    //apply value offset to pick the desired move. use modulus to wrap in range 0..2
   return Object
        .values(moveValues)
        .find(m => m.value === (opponentMove.value + desiredOutcome.offset + 3) % 3);
}

function calculateRound(opponentMove, myMove) {
    let score = myMove.value + 1; //move values lowered by one for convenience, so add 1 back

    if (opponentMove.value === myMove.value) {
        console.log('draw');
        score += draw;
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
        case 0: return 'R';
        case 1: return 'P';
        case 2: return 'S';
    }
}

async function run() {
    const input = await readInput();
    const score = calculateScore(input);
    console.log(score);
}

run();