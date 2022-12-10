const fs = require('fs');
const fsPromises = fs.promises;

const commands = {
    cd: 'cd',
    ls: 'ls',
    dir: 'dir',
    file: 'file',
};

async function readInput() {
    const buffer = await fsPromises.readFile('input.txt');
    return buffer.toString().split('\n');
}

function getFileTree(inputs) {
    const rootDir = '/';
    const tree = {
        name: rootDir,
        size: 0,
        childDirs: [],
        parentDir: undefined,
    };
    let cwd = tree;

    let i = 1;
    for (const input of inputs) {
        console.log(i++, input);
        //console.log(cwd);
        const type = getInputType(input);
        switch (type) {
            case commands.cd:
                const nextDir = getCdTarget(input);
                if (nextDir === rootDir) {
                    // special case since we start in /
                    break;
                }

                if (nextDir === '..') {
                    cwd = cwd.parentDir;
                    break;
                }

                cwd = cwd.childDirs.find(d => d.name === nextDir);
                break;

            case commands.dir:
                const dirName = getDirName(input);
                cwd.childDirs.push(
                    {
                        name: dirName,
                        size: 0,
                        childDirs: [],
                        parentDir: cwd,
                    }
                );
                break;

            case commands.file:
                const fileSize = getFileSize(input);
                cwd.size += fileSize;
                break;

            case commands.ls:
                break;
        }
    }

    return tree;
}

function getInputType(input) {
    if (input.startsWith('$ cd')) {
        return commands.cd;
    } 
    
    if (input.startsWith('$ ls')) {
        return commands.ls;
    } 
    
    if (input.startsWith('dir')) {
        return commands.dir;
    } 
    
    return commands.file;
}

function getCdTarget(input) {
    return /\$ cd (.*)/.exec(input)[1];
}

function getDirName(input) {
    return /dir (.*)/.exec(input)[1];
}

function getFileSize(input) {
    return Number.parseInt(/(\d*) .*/.exec(input)[1]);
}

function getSizeOfLargeDirectories(cwd, min, max) {
    let totalSize = cwd.size;
    let totalSizeInRange = 0;

    for (const childDir of cwd.childDirs) {
        const { 
            totalSize: childTotalSize, 
            totalSizeInRange: childTotalSizeInRange,
        } = getSizeOfLargeDirectories(childDir, min, max);
        totalSize += childTotalSize;
        totalSizeInRange += childTotalSizeInRange;
    }

    if (totalSize >= min && totalSize <= max) {
        totalSizeInRange += totalSize;
    }

    return {
        totalSize,
        totalSizeInRange,
    };
}

function getSpaceNeededToFree(totalSize) {
    const diskSize = 70000000;
    const totalSpaceNeeded = 30000000;
    return totalSpaceNeeded - (diskSize - totalSize);
}

async function run() {
    const input = await readInput();

    const tree = getFileTree(input);
    const { totalSize } = getSizeOfLargeDirectories(tree, 0, Number.POSITIVE_INFINITY);
    const sizeToFree = getSpaceNeededToFree(totalSize);

    // this algorithim is Big-OMG bad
    let totalSizeInRange = 0;
    let max = sizeToFree;
    while (!totalSizeInRange) {
        ({ totalSizeInRange } = getSizeOfLargeDirectories(tree, sizeToFree, max++));
    }
    console.log(totalSizeInRange);
}

run();