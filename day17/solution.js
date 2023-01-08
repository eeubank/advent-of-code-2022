const fs = require('fs');
const fsPromises = fs.promises;

const BLOCK_ROW_MASK = 127;
const SHAFT_WIDTH = 7;
const NEXT_BLOCK_Y_OFFSET = 3;
const EDGE_LEFT = 64;
const EDGE_RIGHT = 1;

class Shaft {
    height;
    rows = new Array(this.height).fill(0);
    maxRowNumSet = -1n;

    constructor(height) {
        this.height = height;
    }

    get(rowNum) {
        if (!this.hasRowBeenSet(rowNum)) {
            return 0;
        }
        return this.rows[rowNum % BigInt(this.height)];
    }

    getRowHistory(count) {
        return new Array(count).fill(0).map((_, idx) => this.get(this.maxRowNumSet - BigInt(idx)));
    }

    set(rowNum, value) {
        if (!this.hasRowBeenSet(rowNum)) {
            this.rows[rowNum % BigInt(this.height)] = 0;
            this.maxRowNumSet = rowNum;
        }
        this.rows[rowNum % BigInt(this.height)] |= value;
    }

    hasRowBeenSet(rowNum) {
        return rowNum <= this.maxRowNumSet;
    }

    print() {
        for (let i = this.height - 1; i >= 0; i--) {
            console.log(`|${this.rows[i].toString(2).padStart(SHAFT_WIDTH, 0).replaceAll('0', '.').replaceAll('1', '#')}|`);
        }
        console.log('---------');
    }
}

class CycleTracker {
    samples = new Map();
    historyLen;

    constructor(historyLen) {
        this.historyLen = historyLen;
    }

    checkForCycle(windIdx, shapeIdx, blockNum, shaftHeight, shaft) {
        if (blockNum <= this.historyLen) {
            return false;
        }

        const history = shaft.getRowHistory(this.historyLen).join('|');
        const key = `W${windIdx}|S${shapeIdx}|H${history}`;
        
        if (!this.samples.has(key)) {
            this.samples.set(key, [{ shaftHeight, blockNum }]);
            return false;
        }

        const sample = this.samples.get(key);
        sample.push({ shaftHeight, blockNum });
        if (sample.length < 10) {
            return false;
        }
        
        for (let i = 0; i < sample.length - 2; i++) {
            if (sample[i + 2].shaftHeight - sample[i + 1].shaftHeight !== sample[i + 1].shaftHeight - sample[i].shaftHeight
                || sample[i + 2].blockNum - sample[i + 1].blockNum !== sample[i + 1].blockNum - sample[i].blockNum
            ) {
                this.samples.delete(key);
                return false;
            }
        }

        const previousSample = sample.at(-2);

        console.log(sample);
        
        return {
            blockNum,
            blocksInCycle: blockNum - previousSample.blockNum,
            height: shaftHeight - previousSample.shaftHeight,
        };
    }

    calculateAddedShaftHeight(cycle, numBlocks) {
        console.log(cycle, numBlocks);
        const blocksRemaining = numBlocks - cycle.blockNum - 1n;
        const cyclesRemaining = blocksRemaining / cycle.blocksInCycle;
        const heightAdded = cycle.height * cyclesRemaining;
        const blocksConsumed = cyclesRemaining * cycle.blocksInCycle;
        const result = { blocksRemaining, cyclesRemaining, blocksConsumed, heightAdded };
        console.log(result);
        return result;
    }
}

async function readInput(path) {
    const buffer = await fsPromises.readFile(path);
    return buffer.toString().split('');
}

function playTetris(input, numBlocks, checkForCycles = true) {
    const shapeOrder =        ['-', '+', '┘', '|', '□'];
    const shapeHeights =      [ 1,   3,   3,   4,   2 ];
    const shapeSpaceToRight = [ 1,   2,   2,   4,   3 ];
    const shaft = new Shaft(input.length * 5);
    const cycleTracker = new CycleTracker(500);

    let maxY = -1n;
    let thisY = -1n;
    let nextWindIdx = 0;
    let blockHeight = 1;
    let cycle;

    for (let blockNum = 0n; blockNum < numBlocks; blockNum++) {
        const nextY = thisY + BigInt(blockHeight + NEXT_BLOCK_Y_OFFSET);
        maxY = nextY > maxY ? nextY : maxY;
        thisY = maxY;

        const nextShapeIdx = Number(blockNum % BigInt(shapeOrder.length));
        const nextShape = shapeOrder[nextShapeIdx];
        let block = createBlock(nextShape);
        blockHeight = shapeHeights[nextShapeIdx];
        const moveDownBlockHeight = nextShape === '+' ? 2 : 1;

        const startWindIdx = (nextWindIdx + 1) % input.length;

        // move down through the offset immediately, this is always clear
        thisY -= BigInt(NEXT_BLOCK_Y_OFFSET);
        let spaceToLeft = 2;
        let spaceToRight = shapeSpaceToRight[nextShapeIdx];
        let shift = 0;
        let nextWind;
        for (let i = 0; i < NEXT_BLOCK_Y_OFFSET; i++) {
            nextWind = input[nextWindIdx++ % input.length];
            if (nextWind === '>') {
                if (spaceToRight > 0) {
                    spaceToRight--;
                    spaceToLeft++;
                    shift++;
                }
            } else {
                if (spaceToLeft > 0) {
                    spaceToRight++;
                    spaceToLeft--;
                    shift--;
                }
            }
        }
        if (shift < 0) {
            block <<= Math.abs(shift);
        }
        if (shift > 0) {
            block >>= shift;
        }

        let canFall = true;
        while (canFall) {
            nextWind = input[nextWindIdx++ % input.length];
            if (nextWind === '>') {
                if (canShiftRight(block, blockHeight, thisY, shaft)) {
                    block >>= 1;
                }
            } else {
                if (canShiftLeft(block, blockHeight, thisY, shaft)) {
                    block <<= 1;
                }
            }
            canFall = canMoveDown(block, moveDownBlockHeight, thisY, shaft);
            if (canFall) {
                thisY--;
            } else {
                setInShaft(block, blockHeight, thisY, shaft);
                if (checkForCycles && !cycle) {
                    const cycleFound = cycleTracker.checkForCycle(startWindIdx, nextShapeIdx, blockNum, maxY > thisY ? maxY : thisY, shaft);
                    if (cycleFound) {
                        cycle = cycleTracker.calculateAddedShaftHeight(cycleFound, numBlocks);
                        numBlocks -= cycle.blocksConsumed;
                        console.log(shapeOrder[nextShapeIdx]);  
                    }
                }
            }
        }
    }

    //shaft.print();
    return maxY + (cycle ? cycle.heightAdded : 0n);
}

function createBlock(shape) {
    switch(shape) {
        case '-':
            //0011110
            return 30; 

        case '+':
            //0001000
            //0011100
            //0001000
            return 134664; 

        case '┘':
            //0000100
            //0000100
            //0011100
            return 66076;

        case '|':
            //0010000
            //0010000
            //0010000
            //0010000
            return 33818640;

        case '□':
            //0011000
            //0011000
            return 3096;
    }
}

function canShiftLeft(block, blockHeight, y, shaft) {
    for (let i = 0; i < blockHeight; i++) {
        const blockRow = (block & (BLOCK_ROW_MASK << (i * SHAFT_WIDTH))) >> (i * SHAFT_WIDTH);
        if ((blockRow & EDGE_LEFT) !== 0) {
            return false;
        }
        if (((blockRow << 1) & shaft.get(y + BigInt(i))) !== 0) {
            return false;
        }
    }
    return true;
}

function canShiftRight(block, blockHeight, y, shaft) {
    for (let i = 0; i < blockHeight; i++) {
        const blockRow = (block & (BLOCK_ROW_MASK << (i * SHAFT_WIDTH))) >> (i * SHAFT_WIDTH);
        if ((blockRow & EDGE_RIGHT) !== 0) {
            return false;
        }
        if (((blockRow >> 1) & shaft.get(y + BigInt(i))) !== 0) {
            return false;
        }
    }
    return true;
}

function canMoveDown(block, blockHeight, y, shaft) {
    if (y === 0n) {
        return false;
    }
    for (let i = 0; i < blockHeight; i++) {
        const blockRow = (block & (BLOCK_ROW_MASK << (i * SHAFT_WIDTH))) >> (i * SHAFT_WIDTH);
        if ((blockRow & shaft.get((y - 1n) + BigInt(i))) !== 0) {
            return false;
        }
    }
    return true;
}

function setInShaft(block, blockHeight, y, shaft) {
    for (let i = 0; i < blockHeight; i++) {
        shaft.set(y + BigInt(i), (block & (BLOCK_ROW_MASK << (i * SHAFT_WIDTH))) >> (i * SHAFT_WIDTH));
    };
}

async function run() {
    console.log('\nTEST 2022 ================================');
    {
        const input = await readInput('testinput.txt');

        {
            console.time();
            const height = playTetris(input, 2022n);
            console.log('Height 2022', height);
            console.timeEnd();
        }
    }
    console.log('\nREAL 2022 ================================');
    {
        const input = await readInput('input.txt');

        {
            console.time();
            const height = playTetris(input, 2022n);
            console.log('Height 2022', height);
            console.timeEnd();
        }
    }
    console.log('\nTEST 1 T  ================================');
    {
        const input = await readInput('testinput.txt');

        {
            console.time();
            const height = playTetris(input, 1000000000000n);
            console.log('Height 1000000000000', height);
            console.timeEnd();
        }
    }
    console.log('\nREAL 1 T  ================================');
    {
        const input = await readInput('input.txt');

        {
            console.time();
            const height = playTetris(input, 1000000000000n);
            console.log('Height 1000000000000', height);
            console.timeEnd();
        }
    }
    console.log();
}

run();