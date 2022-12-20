const fs = require('fs');
const fsPromises = fs.promises;

const HOLE_X = 500;
const HOLE = 'x';
const AIR = '.';
const WALL = '#';
const SAND = 'o';

async function readInput(path) {
    const buffer = await fsPromises.readFile(path);
    return buffer.toString().split('\n');
}

function calculateGrainsOfSand(inputs, withFloor = false) {
    const dimensions = parseDimensions(inputs);
    const cave = generateCave(dimensions, withFloor);

    let grains = 0;
    while(simulateSand(cave, dimensions.offsetX)) {
        grains++;
    }
    if (withFloor) {
        grains++;
    }

    //printCave(cave);

    return grains;
}

function parseDimensions(inputs) {
    const allCoords = [];
    let minX = Number.POSITIVE_INFINITY;
    let maxX = 0;
    let maxY = 0;

    for (const wall of inputs) {
        const coords = wall.split(' -> ').map(c => {
            const xy = c.split(',');
            return { x: +xy[0], y: +xy[1] };
        });
        coords.forEach(c => {
            minX = Math.min(minX, c.x);
            maxX = Math.max(maxX, c.x);
            maxY = Math.max(maxY, c.y);
        });
        allCoords.push(coords);
    }

    return {
        coords: allCoords,
        offsetX: minX - 200,
        maxX: maxX - minX + 400,
        maxY: maxY + 2,
    };
}

function generateCave(dimensions, withFloor) {
    const cave = Array.from(
        new Array(dimensions.maxY + 1), () => new Array(dimensions.maxX + 1).fill(AIR));

    for (const row of dimensions.coords) {
        for (let i = 0; i < row.length - 1; i++) {
            drawLine(row[i], row[i + 1], dimensions.offsetX, cave);
        }
    }

    if (withFloor) {
        drawLine({x: 0, y: dimensions.maxY},{x: dimensions.maxX, y: dimensions.maxY}, 0, cave);
    }

    cave[0][HOLE_X - dimensions.offsetX] = HOLE;

    return cave;
}

function drawLine(v1, v2, offsetX, cave) {
    cave[v1.y][v1.x - offsetX] = WALL;
    cave[v2.y][v2.x - offsetX] = WALL;
    if (v1.x !== v2.x) {
        for (let x = Math.min(v1.x, v2.x); x < Math.max(v1.x, v2.x); x++) {
            cave[v1.y][x - offsetX] = WALL;
        }
    } else if (v1.y !== v2.y) {
        for (let y = Math.min(v1.y, v2.y); y < Math.max(v1.y, v2.y); y++) {
            cave[y][v1.x - offsetX] = WALL;
        }
    }
}

function simulateSand(cave, offsetX) {
    const grain = { x: HOLE_X - offsetX, y: 0 };
    for (;;) {
        if (!dropGrain(grain, cave)) {
            return false;
        }
        if (!rollGrain(grain, cave)) {
            cave[grain.y][grain.x] = SAND;
            return grain.y !== 0;
        }
    }
}

function dropGrain(grain, cave) {
    for (;;) {
        if (grain.y + 1 >= cave.length) {
            return false;
        }
        if ([WALL, SAND].includes(cave[grain.y + 1][grain.x])) {
            return true;
        }
        grain.y++;
    }
}

function rollGrain(grain, cave) {
    if (cave[grain.y + 1][grain.x - 1] === AIR) {
        grain.y += 1;
        grain.x -= 1;
        return true;
    }

    if (cave[grain.y + 1][grain.x + 1] === AIR) {
        grain.y += 1;
        grain.x += 1;
        return true;
    }

    return false;
}

function printCave(cave) {
    cave.forEach(row => {
        row.forEach(c => process.stdout.write(c));
        process.stdout.write('\n');
    });
}

async function run() {
    const input = await readInput('input.txt');
    const grainsOfSandWithPit = calculateGrainsOfSand(input);
    console.log('grainsOfSandWithPit', grainsOfSandWithPit);
    const grainsOfSandWithFloor = calculateGrainsOfSand(input, true);
    console.log('grainsOfSandWithFloor', grainsOfSandWithFloor);
}

run();