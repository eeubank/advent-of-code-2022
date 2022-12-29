const fs = require('fs');
const fsPromises = fs.promises;

async function readInput(path) {
    const buffer = await fsPromises.readFile(path);
    return buffer.toString().split('\n');
}

function calcMaxPressureRelease(inputs, minutes) {
    let maxPressureReleased = 0;
    const knownPaths = new Map();
    const bestPressureReleasedMap = new Map();
    let lastPath = [];
    let trials = 0;
    
    const entrance = generateTunnelNetwork(inputs);
    
    while (lastPath.length !== 1) {
        if (trials % 10000 === 0) {
            process.stdout.write('.');
        }
        trials++;
        let valve = entrance;
        let minutesLeft = minutes;
        let trialPressureReleased = 0;
        const path = [valve.id];
        movesLeft = true;

        while (movesLeft) {
            let bestNeighborPressureReleased = 0;
            let bestNeighbor;
            for (const neighbor of valve.weightedNeighbors) {
                if (path.some(id => id === neighbor.id)) {
                    continue;
                }
                if (knownPaths.has([...path, neighbor.id].join('|'))) {
                    continue;
                }
                if (minutesLeft - neighbor.minutes < 0) {
                    continue;
                }
                const pressureReleased = neighbor.valve.rate * (minutesLeft - neighbor.minutes);
                if (pressureReleased > bestNeighborPressureReleased) {
                    bestNeighborPressureReleased = pressureReleased;
                    bestNeighbor = neighbor;
                }
            }
            if (!bestNeighbor) {
                movesLeft = false;
                break;
            }
            minutesLeft -= bestNeighbor.minutes;
            trialPressureReleased += bestNeighborPressureReleased;
            path.push(bestNeighbor.id);
            valve = bestNeighbor.valve;
        }

        const sortedPathKey = [...path].sort().join('|');
        const bestPressureForSortedPathKey = bestPressureReleasedMap.get(sortedPathKey) ?? 0;
        bestPressureReleasedMap.set(sortedPathKey, Math.max(trialPressureReleased, bestPressureForSortedPathKey));

        knownPaths.set(path.join('|'), trialPressureReleased); 

        maxPressureReleased = Math.max(trialPressureReleased, maxPressureReleased);
        lastPath = path;
    }

    return { maxPressureReleased, bestPressureReleasedMap };
}

function generateTunnelNetwork(inputs) {
    const valves = {};
    let entrance;

    for (const input of inputs) {
        const match = /Valve (?<id>[A-Z]{2}) has flow rate=(?<rate>\d+); tunnel(s)? lead(s)? to valve(s)? (?<linked>([A-Z]{2}(, )?)+)/.exec(input);
        const valve = {
            id: match.groups.id,
            rate: +match.groups.rate,
            neighborIds: match.groups.linked,
        };
        valves[valve.id] = valve;
        if (valve.id === 'AA') {
            entrance = valve;
        }
    }

    for (const valve of Object.values(valves)) {
        valve.neighbors = valve.neighborIds.split(', ').map(id => valves[id]);
    }

    for (const start of Object.values(valves)) {
        start.weightedNeighbors = [];
        for (const end of Object.values(valves)) {
            if (start === end || end.rate === 0) {
                continue;
            }

            start.weightedNeighbors.push({
                id: end.id,
                valve: end,
                minutes: findDistanceBetweenValves(start, end, valves).distance + 1,
            });
        }
    }

    return entrance;
}

function findDistanceBetweenValves(start, end, valves) {
    resetValves(valves);
    const queue = [];
    start.visited = true;
    queue.push(start);

    while (queue.length) {
        const valve = queue.shift();

        if (valve === end) {
            return getDistance(valve);
        }

        for (const neighbor of valve.neighbors) {
            if (neighbor.visited) {
                continue;
            }
            neighbor.visited = true;
            neighbor.parent = valve;
            queue.push(neighbor);
        }
    }
}

function resetValves(valves) {
    Object.values(valves).forEach(v => {
        v.visited = false;
        v.parent = null;
    });
}

function getDistance(valve) {
    let distance = 0;
    const path = [];

    let thisValve = valve;
    while (thisValve.parent) {
        distance++;
        thisValve = thisValve.parent;
        path.unshift(thisValve.id);
    }

    return { distance, path };
}

function findBestPathPairs(bestPressureReleasedMap) {
    let maxPressureReleased = 0;
    for (const tuple1 of bestPressureReleasedMap) {
        const p1 = tuple1[0].split('|');
        for (const tuple2 of bestPressureReleasedMap) {
            const p2 = tuple2[0].split('|');
            if (hasOverlap(p1, p2)) {
                continue;
            }
            maxPressureReleased = Math.max(tuple1[1] + tuple2[1], maxPressureReleased);
        }
    }

    return maxPressureReleased;
}

function hasOverlap(arr1, arr2) {
    for (let i1 = 1; i1 < arr1.length; i1++) {
        for (let i2 = 1; i2 < arr2.length; i2++) {
            if (arr1[i1] === arr2[i2]) {
                return true;
            }
        }
    }
    return false;
}

async function run() {
    const input = await readInput('input.txt');

    {
        console.time();
        const { maxPressureReleased } = calcMaxPressureRelease(input, 30);
        console.log('\n1 player', maxPressureReleased);
        console.timeEnd();
    }

    {
        console.time();
        const { bestPressureReleasedMap } = calcMaxPressureRelease(input, 26);
        const maxPressureReleased = findBestPathPairs(bestPressureReleasedMap);
        console.log('\n2 players', maxPressureReleased);
        console.timeEnd();
    }
}

run();