let ANIMATE_SPEED = 'slow';
const MAX_HEIGHT = 28;

function readInput(input) {
    const stackStateTextArray = [];
    const movesTextArray = [];
    let readingStackState = true;
    
    for (const line of input.toString().split('\n')) {
        if (line === '') {
            readingStackState = false;
            continue;
        }

        if (readingStackState) {
            stackStateTextArray.push(line);
        } else {
            movesTextArray.push(line);
        }
    };

    return {
        stackStateTextArray,
        movesTextArray,
    };
}

function getStacks(stackStateTextArray) {
    // the last line is numberic stack labels with two spaces between each (i.e. 1  2  3)
    const stackCountText = stackStateTextArray.slice(-1)[0].split('  ');
    // the last number is the number of stacks we need
    const stackCount = Number.parseInt(stackCountText.slice(-1)[0]);
    //create a two-diminsional array to represent the stacks
    const stacks = Array.from(Array(stackCount), () => new Array());
    
    // process the text backwards to setup stacks, skip the line processed above
    for (let i = stackStateTextArray.length - 2; i >= 0; i--) {
        const stackStateText = stackStateTextArray[i];
        for (let j = 0; j < stackCount; j++) {
            // stack items start on index 1 and have 4 characters between each
            const stackItem = stackStateText[(j * 4) + 1];
            if (stackItem === ' ') {
                continue;
            }
            stacks[j].push({
                label: stackItem,
                id: Number.parseInt(`${i}${j}`),
            });
        }
    }

    return stacks;
}

function drawStacks(stacks) {
    const crateContainerEle = document.getElementById('crates');
    
    stacks.forEach((stack, stackIdx) => {
        stack.forEach((crate, crateIdx) => {
            const crateEle = document.createElement('div');
            crateEle.id = getCrateEleId(crate.id);
            crateEle.className = `${getStackClass(stackIdx + 1)} ${getHeightClass(crateIdx)}`;
            crateEle.innerText = `${crate.label}`;
            crateContainerEle.appendChild(crateEle);
        });
    });
}

async function animateMoves(movesTextArray, stacks, model, isFast) {
    ANIMATE_SPEED = isFast ? 'fast' : 'slow';
    setTrackProgressEle(0);
    
    for (let i = 0; i < movesTextArray.length; i++) {
        const moveText = movesTextArray[i];
        const move = readMoveText(moveText);
        const stackFrom = stacks[move.from - 1];
        const stackTo = stacks[move.to - 1];
        
        if (model === '9000') {
            let itemsRemaining = move.amount;
            while (itemsRemaining--) {
                const crate = stackFrom.pop();
                
                await moveCraneClaw(move.from);
                await setClawHeight(move.from, stackFrom.length);
                await setClawCratesHeight(move.from, crate.id);
                await moveCraneClawCrates(move.to, crate.id);
                await setClawCratesHeight(move.to, crate.id, stackTo.length);
                await setClawHeight(move.to);

                stackTo.push(crate);
            }
        } else {
            const crates = stackFrom.slice(-move.amount);
            const crateIds = crates.map(c => c.id);
                
            await moveCraneClaw(move.from);
            await setClawHeight(move.from, stackFrom.length - 1);
            await setClawCratesHeight(move.from, crateIds);
            await moveCraneClawCrates(move.to, crateIds);
            await setClawCratesHeight(move.to, crateIds, stackTo.length);
            await setClawHeight(move.to);

            stackFrom.length -= move.amount;
            stackTo.push(...crates);
        }

        setTrackProgressEle((i + 1) / movesTextArray.length);
    };
}

function readMoveText(moveText) {
    const elements = moveText.split(' ');
    return {
        amount: Number.parseInt(elements[1]),
        from: Number.parseInt(elements[3]),
        to: Number.parseInt(elements[5]),
    };
}

async function moveCrane(stack) {
    return new Promise(resolve => {
        const craneEle = getCraneEle();
        const stackClass = getStackClass(stack);
        if (craneEle.classList.contains(stackClass)) {
            resolve();
        } else {
            craneEle.className = `${stackClass} ${getAnimateStackClass()}`;
            craneEle.addEventListener('transitionend', () => {
                resolve();
            });
        }
    });
}

async function moveClaw(stack, height = MAX_HEIGHT) {
    return new Promise(resolve => {
        const clawEle = getClawEle();
        const stackClass = getStackClass(stack);
        if (clawEle.classList.contains(stackClass)) {
            resolve();
        } else {
            clawEle.className = `${stackClass} ${getAnimateStackClass()} ${getHeightClass(height)}`;
            clawEle.addEventListener('transitionend', () => {
                resolve();
            });
        }
    });
}

async function moveCrates(stack, crates, height = MAX_HEIGHT) {
    if (Array.isArray(crates)) {
        return Promise.all(crates.map(crate => moveCrate(stack, crate, height)));
    } else {
        return moveCrate(stack, crates, height);
    }
}

async function moveCrate(stack, crate, height = MAX_HEIGHT) {
     return new Promise(resolve => {
         const crateEle = getCrateEle(crate);
         const stackClass = getStackClass(stack);
         if (crateEle.classList.contains(stackClass)) {
             resolve();
         } else {
             crateEle.className = `${stackClass} ${getAnimateStackClass()} ${getHeightClass(height)}`;
             crateEle.addEventListener('transitionend', () => {
                 resolve();
             });
         }
     });
 }

async function moveCraneClaw(stack, height = MAX_HEIGHT) {
    return Promise.all([
       moveCrane(stack),
       moveClaw(stack, height),
    ]);
}

async function moveCraneClawCrates(stack, crates, height = MAX_HEIGHT) {
    return Promise.all([
        moveCrane(stack),
        moveClaw(stack, height),
        moveCrates(stack, crates, height),
    ]);
}

async function setClawHeight(stack, height = MAX_HEIGHT) {
    return new Promise(resolve => {
        const clawEle = getClawEle();
        const heightClass = getHeightClass(height);
        if (clawEle.classList.contains(heightClass)) {
            resolve();
        } else {
            clawEle.className = `${getStackClass(stack)} ${heightClass} ${getAnimateHeightClass()}`;
            clawEle.addEventListener('transitionend', () => {
                resolve();
            });
        }
    });
}

async function setCratesHeight(stack, crates, height = MAX_HEIGHT) {
    if (Array.isArray(crates)) {
        return Promise.all(crates.map((crate, idx) => setCrateHeight(stack, crate, height + idx)));
    } else {
        return setCrateHeight(stack, crates, height);
    }
}

async function setCrateHeight(stack, crate, height = MAX_HEIGHT) {
    return new Promise(resolve => {
        const crateEle = getCrateEle(crate);
        const heightClass = getHeightClass(height);
        crateEle.style.zIndex = height;
        if (crateEle.classList.contains(heightClass)) {
            resolve();
        } else {
            crateEle.className = `${getStackClass(stack)} ${heightClass} ${getAnimateHeightClass()}`;
            crateEle.addEventListener('transitionend', () => {
                resolve();
            });
        }
    });
}

async function setClawCratesHeight(stack, crates, height = MAX_HEIGHT) {
    return Promise.all([
       setClawHeight(stack, height),
       setCratesHeight(stack, crates, height),
    ]);
}

function getStackClass(stack) {
    return `stack_${stack}`;
}

function getHeightClass(height) {
    return `height_${Math.min(height, MAX_HEIGHT)}`;
}

function getAnimateStackClass() {
    return `animate_x_${ANIMATE_SPEED}`;
}

function getAnimateHeightClass() {
    return `animate_y_${ANIMATE_SPEED}`;
}

function getCraneEle() {
    return document.getElementById('crane');
}

function getClawEle() {
    return document.getElementById('claw');
}

function getCrateEle(crate) {
    return document.getElementById(getCrateEleId(crate));
}

function getCrateEleId(crate) {
    return `crate_${crate}`;
}

function setTrackProgressEle(amount) {
    document.getElementById('track_progress').style.width = `${amount * 100}%`;
}