const fs = require('fs');
const fsPromises = fs.promises;

class Sensor {
    x; y;
    radius;
    beacon;

    constructor(x, y, beacon) {
        this.x = x;
        this.y = y;
        this.radius = Math.abs(x - beacon.x) + Math.abs(y - beacon.y);
        this.beacon = beacon;
    }

    rangeCovered(row) {
        const modifiedRadius = Math.max(0, this.radius - (Math.abs(this.y - row)));
        if (modifiedRadius === 0) {
            return null;
        }

        return { min: this.x - modifiedRadius, max: this.x + modifiedRadius };
    }

    positionsCovered(row) {
        const range = this.rangeCovered(row);
        if (range == null) {
            return [];
        }

        const positions = [];
        for (let x = range.min; x <= range.max; x++) {
            if (this.beacon.y === row && this.beacon.x === x) {
                continue;
            }
            positions.push(x);
        }

        return positions;
    }
}

class Beacon {
    x; y;

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

async function readInput(path) {
    const buffer = await fsPromises.readFile(path);
    return buffer.toString().split('\n');
}

function calcPositionsWithoutBeacons(input, row) {
    const sensors = parseSensors(input);
    const set = new Set();
    sensors.forEach(s => s.positionsCovered(row).forEach(p => set.add(p)));
    return set.size;
}

function calcDistressFreq(input, minXY, maxXY) {
    const sensors = parseSensors(input);
    let x, y;
    for (let row = minXY; row <= maxXY; row++) {
        const ranges = sensors.map(s => s.rangeCovered(row))
            .filter(r => r != null)
            .sort((r1, r2) => r1.min - r2.min);

        let v1 = { min: 0, max: 0 }, v2 = { min: 0, max: 0 };
        let i1 = 0, i2 = 1;
        while (i1 < ranges.length && i2 < ranges.length) {
            v1 = ranges[i1];
            v2 = ranges[i2];
            if (v2.min < v1.max && v2.max <= v1.max) {
                i2++;
                continue;
            }
            if (v2.min <= v1.max && v2.max > v1.max) {
                v1.max = v2.max;
                i2++;
                continue;
            }

            if (v2.min > v1.max + 1) {
                x = v1.max + 1;
                y = row;
                
                return (x * 4000000) + y;
            }

            i1 = i2 + 1;
            i2++;
        }
    }
}

function parseSensors(inputs) {
    const sensors = [];

    for (const input of inputs) {
        const matches = /Sensor at x=(-?\d+), y=(-?\d+): closest beacon is at x=(-?\d+), y=(-?\d+)/.exec(input);
        const beacon = new Beacon(+matches[3], +matches[4]);
        const sensor = new Sensor(+matches[1], +matches[2], beacon);
        //console.log(sensor);
        sensors.push(sensor);
    }

    return sensors;
}

async function run() {
    const input = await readInput('input.txt');
    
    // for test data
    // const positionsWithoutBeacons = calcPositionsWithoutBeacons(input, 10);
    // console.log('positionsWithoutBeacons', positionsWithoutBeacons);
    // const distressFreq = calcDistressFreq(input, 0, 20);
    // console.log('distressFreq', distressFreq);

    const positionsWithoutBeacons = calcPositionsWithoutBeacons(input, 2000000);
    console.log('positionsWithoutBeacons', positionsWithoutBeacons);
    const distressFreq = calcDistressFreq(input, 0, 4000000);
    console.log('distressFreq', distressFreq);
}

run();