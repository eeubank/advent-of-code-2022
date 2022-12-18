const fs = require('fs');
const fsPromises = fs.promises;

async function readInput(path) {
    const buffer = await fsPromises.readFile(path);
    return buffer.toString().split('\n');
}

function calculateSteps(input, startIds) {
    const nodes = buildGraphNodes(input);
    const distances = findStartNodes(nodes, startIds)
        .map(n => findDistanceToEndNode(nodes, n))
        .sort();

    return distances[0];
}

function buildGraphNodes(input) {
    const nodes = input.map(line => line.split('').map(id => {
        const isStart = id === 'S';
        const isEnd = id === 'E';
        return { 
            id,
            elevation: isStart ? 'a' :isEnd ? 'z' : id,
            neighbors: [],
            visited: false,
            parent: null,
        };
    }));
    linkNodes(nodes);
    return nodes;
}

function linkNodes(nodes) {
    for (let y = 0; y < nodes.length; y++) {
        for (let x = 0; x < nodes[y].length; x++) {
            const node = nodes[y][x];
            [{x, y: y-1},{x, y: y+1},{x: x-1, y},{x: x+1, y}].forEach(neighbor => {
                if (canMove(nodes, neighbor.x, neighbor.y, node)) {
                    node.neighbors.push(nodes[neighbor.y][neighbor.x]);
                }
            });
        }
    }
}

function findStartNodes(nodes, ids) {
    const startNodes = [];
    for (const row of nodes) {
        for (const node of row) {
            if (ids.includes(node.id)) {
                startNodes.push(node);
            }
        }
    }
    return startNodes;
}

function findDistanceToEndNode(nodes, startNode) {
    resetNodes(nodes);

    const queue = [];
    startNode.visited = true;
    queue.push(startNode);

    while (queue.length) {
        const node = queue.shift();

        if (node.id === 'E') {
            return getDistance(node);
        }

        for (const neighbor of node.neighbors) {
            if (neighbor.visited) {
                continue;
            }
            neighbor.visited = true;
            neighbor.parent = node;
            queue.push(neighbor);
        }
    }
}

function resetNodes(nodes) {
    nodes.forEach(row => row.forEach(node => {
        node.visited = false;
        node.parent = null;
    }));
}

function getDistance(node) {
    let distance = 0;
    let thisNode = node;
    while (thisNode.parent) {
        distance++;
        thisNode = thisNode.parent;
    }

    return distance;
}

function canMove(nodes, x, y, previous) {
    if (y < 0 || y >= nodes.length || x < 0 || x >= nodes[y].length) {
        return false;
    }
    return previous.elevation.charCodeAt(0) - nodes[y][x].elevation.charCodeAt(0) >= -1;
}

async function run() {
    const input = await readInput('input.txt');
    const stepsFromStart = calculateSteps(input, ['S']);
    console.log('From S', stepsFromStart);
    const stepsFromA = calculateSteps(input, ['S', 'a']);
    console.log('From A', stepsFromA);
}

run();