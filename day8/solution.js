const fs = require('fs');
const fsPromises = fs.promises;

async function readInput() {
    const buffer = await fsPromises.readFile('input.txt');
    return buffer.toString().split('\n');
}

function buildGrid(input) {
    const grid = new Array();

    for (const row of input) {
        grid.push(row.split('').map(treeHeight => ({
            height: Number.parseInt(treeHeight),
            visible: false,
            scenicScore: 0,
            scenicWest: 0,
            scenicNorth: 0,
            scenicEast: 0,
            scenicWest: 0,
        })));
    }

    return grid;
}
// over engineered to get close to linear time
function getVisibleTrees(grid) {
    let visibleTrees = 0;
    const westMaxHeight = new Array(grid.length).fill(-1);
    const northMaxHeight = new Array(grid[0].length).fill(-1);
    const { eastDist, southDist } = calcTreeDistributions(grid);

    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
            const tree = grid[y][x];
            eastDist[y][tree.height]--;
            southDist[x][tree.height]--;
            if (isTreeVisible(tree.height, westMaxHeight[y], northMaxHeight[x], eastDist[y], southDist[x])) {
                tree.visible = true;
                visibleTrees++;
            }
            westMaxHeight[y] = Math.max(westMaxHeight[y], tree.height);
            northMaxHeight[x] = Math.max(northMaxHeight[x], tree.height);
        }
    }

    return visibleTrees;
}

function calcTreeDistributions(grid) {
    const eastDist = Array.from(new Array(grid[0].length), () => new Array(10).fill(0));
    const southDist = Array.from(new Array(grid.length), () => new Array(10).fill(0));

    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
            const tree = grid[y][x];
            eastDist[y][tree.height]++;
            southDist[x][tree.height]++;
        }
    }

    return { eastDist, southDist };
}

function isTreeVisible(treeHeight, westMaxHeight, northMaxHeight, eastDist, southDist) {
    return treeHeight > westMaxHeight 
        || treeHeight > northMaxHeight 
        || eastDist.slice(treeHeight).reduce((acc, h) => acc + h) === 0
        || southDist.slice(treeHeight).reduce((acc, h) => acc + h) === 0;
}

// under engineered b/c computers are fast enough... ;-)
function getBestScenicScore(grid) {
    let maxScenicScore = 0;
    
    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
            const tree = grid[y][x];
            calculateScenicScore(tree, grid, x, y);
            maxScenicScore = Math.max(maxScenicScore, tree.scenicScore);
        }
    }

    return maxScenicScore;
}

function calculateScenicScore(tree, grid, x, y) {
    let iWest = x - 1;
    while (iWest >= 0 && tree.height > grid[y][iWest].height) { iWest--; }
    tree.scenicWest = x - Math.max(iWest, 0);

    let iEast = x + 1;
    while (iEast < grid[y].length && tree.height > grid[y][iEast].height) { iEast++; }
    tree.scenicEast = Math.min(iEast, grid[y].length - 1) - x;

    let iNorth = y - 1;
    while (iNorth >= 0 && tree.height > grid[iNorth][x].height) { iNorth--; }
    tree.scenicNorth = y - Math.max(iNorth, 0);

    let iSouth = y + 1;
    while (iSouth < grid.length && tree.height > grid[iSouth][x].height) { iSouth++; }
    tree.scenicSouth = Math.min(iSouth, grid.length - 1) - y;

    tree.scenicScore = tree.scenicWest * tree.scenicNorth * tree.scenicEast * tree.scenicSouth;
}

function printGrid(grid) {
    for (const row of grid) {
        console.log(row
            .map(tree => `( ${tree.height}${tree.visible ? '*' : ' '} ${tree.scenicWest}/${tree.scenicNorth}/${tree.scenicWest}/${tree.scenicSouth}//${tree.scenicScore} )`)
            .join(' ')
        );
    }
}

async function run() {
    const input = await readInput();
    const grid = buildGrid(input);
    const visibleTrees = getVisibleTrees(grid);
    const scenicScore = getBestScenicScore(grid);
    //printGrid(grid);
    console.log('# visible', visibleTrees, 'Max scenic score', scenicScore);
}

run();