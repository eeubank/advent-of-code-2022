const fs = require('fs');
const fsPromises = fs.promises;

async function readInput() {
    const buffer = await fsPromises.readFile('input.txt');
    return buffer.toString();
}

function findMarkers(input, windowLength) {
    let markers = [];
    
    for (let datastream of input.split('\n')) {
        const window = {
            start: 0,
            end: windowLength,
        };

        while (window.end <= datastream.length) {
            let hasDup = false;
            datastream
                .slice(window.start, window.end)
                .split('')
                .sort()
                .reduce((a, b) => {
                    hasDup |= (a === b);
                    return b;
                });
            
            if (!hasDup) {
                markers.push(window.end);
                break;
            }

            window.start++;
            window.end++;
        }
    }
    
    return markers;
}

async function run() {
    const input = await readInput();

    console.log('Packet markers');
    console.log(findMarkers(input, 4));
    
    console.log('Message markers');
    console.log(findMarkers(input, 14));
}

run();