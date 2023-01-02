const fs = require('fs');
const fsPromises = fs.promises;

const BLOCK_ROW_MASK = 127;
const SHAFT_WIDTH = 7;
const NEXT_BLOCK_Y_OFFSET = 3;
const EDGE_LEFT = 64;
const EDGE_RIGHT = 1;

class Shaft {
    shaftSize = 10000;
    rows = new Array(Number(this.shaftSize)).fill(0);
    maxRowNumSet = 0;

    get(rowNum) {
        if (!this.hasRowBeenSet(rowNum)) {
            return this.walls;
        }
        return this.rows[rowNum % this.shaftSize];
    }

    set(rowNum, value) {
        if (!this.hasRowBeenSet(rowNum)) {
            this.rows[rowNum % this.shaftSize] = this.walls;
            this.maxRowNumSet = rowNum;
        }
        this.rows[rowNum % this.shaftSize] |= value;
    }

    hasRowBeenSet(rowNum) {
        return rowNum <= this.maxRowNumSet;
    }

    print() {
        for (let i = this.shaftSize - 1; i >= 0; i--) {
            console.log(`|${this.rows[i].toString(2).padStart(SHAFT_WIDTH, 0).replaceAll('0', '.').replaceAll('1', '#')}|`);
        }
        console.log('---------');
    }
}

async function readInput(path) {
    const buffer = await fsPromises.readFile(path);
    return buffer.toString().split('');
}

function playTetris(input, numBlocks) {
    const shapeOrder =        ['-', '+', '┘', '|', '□'];
    const shapeHeights =      [ 1,   3,   3,   4,   2 ];
    const shapeSpaceToRight = [ 1,   2,   2,   4,   3 ];
    const shaft = new Shaft();

    let nextShape;
    let maxY = -1;
    let thisY = -1;
    let nextWind = 0;
    let block;
    let blockHeight = 1;
    let moveDownBlockHeight = 1;
    
    for (let blockNum = 0; blockNum < numBlocks; blockNum++) {
        const nextShapeIdx = blockNum % shapeOrder.length;
        let nextY = thisY + blockHeight + NEXT_BLOCK_Y_OFFSET;
        maxY = nextY > maxY ? nextY : maxY;
        thisY = maxY;
        nextShape = shapeOrder[nextShapeIdx];
        block = createBlock(nextShape);
        blockHeight = shapeHeights[nextShapeIdx];
        moveDownBlockHeight = nextShape === '+' ? 2 : 1;

        // move down through the offset immediately, this is always clear
        thisY -= NEXT_BLOCK_Y_OFFSET;
        let spaceToLeft = 2;
        let spaceToRight = shapeSpaceToRight[nextShapeIdx];
        let shift = 0;
        for (let i = 0; i < NEXT_BLOCK_Y_OFFSET; i++) {
            if (input[nextWind++ % input.length] === '>') {
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
            if (input[nextWind++ % input.length] === '>') {
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
            }
        }
    }

    return maxY;
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
        if (((blockRow << 1) & shaft.get(y + i)) !== 0) {
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
        if (((blockRow >> 1) & shaft.get(y + i)) !== 0) {
            return false;
        }
    }
    return true;
}

function canMoveDown(block, blockHeight, y, shaft) {
    if (y === 0) {
        return false;
    }
    for (let i = 0; i < blockHeight; i++) {
        const blockRow = (block & (BLOCK_ROW_MASK << (i * SHAFT_WIDTH))) >> (i * SHAFT_WIDTH);
        if ((blockRow & shaft.get((y - 1) + i)) !== 0) {
            return false;
        }
    }
    return true;
}

function setInShaft(block, blockHeight, y, shaft) {
    for (let i = 0; i < blockHeight; i++) {
        shaft.set(y + i, (block & (BLOCK_ROW_MASK << (i * SHAFT_WIDTH))) >> (i * SHAFT_WIDTH));
    };
}

async function run() {
    const input = await readInput('input.txt');

    {
        console.time();
        const height = playTetris(input, 2022);
        console.log('Height 2022', height);
        console.timeEnd();
    }

    //PART II
    // run n loops
    // check for cycle
    // if found, extrapolate height w/o simulation
    // complete remaining loops

    // if not found, run n loops
    // {
    //     console.time();
    //     const height = playTetris(input, 1000000000000);
    //     console.log('Height 1000000000000', height);
    //     console.timeEnd();
    // }
}

run();