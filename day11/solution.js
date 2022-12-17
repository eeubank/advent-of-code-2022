const fs = require('fs');
const fsPromises = fs.promises;

class Monkey {
    id;
    items;
    testDivisor;
    worryFunc;
    worryDivisor = 3;
    worryClamp;
    truthyMonkey;
    falsyMonkey;

    itemsInspected = 0;

    constructor(id) {
        this.id = id;
    }

    readInMonkeyConfig(inputs, monkies) {
        this.items = inputs[1].split(':')[1].split(',').map(n => Number.parseInt(n));
        const worryEquation = inputs[2].split('=')[1];
        this.worryFunc = new Function('old', `return ${worryEquation};`);
        this.testDivisor = Number.parseInt(inputs[3].split(' ').at(-1));
        this.truthyMonkey = monkies[Number.parseInt(inputs[4].split(' ').at(-1))];
        this.falsyMonkey = monkies[Number.parseInt(inputs[5].split(' ').at(-1))];
        return this;
    }

    throwAllItems(useWorryDivisor) {
        this.itemsInspected += this.items.length;

        while (this.items.length) {
            const item = this.items.pop();
            const worry = useWorryDivisor ?
                Math.floor(this.worryFunc(item) / this.worryDivisor) :
                this.worryFunc(item) % this.worryClamp;
            const nextMonkey = worry % this.testDivisor === 0 ? this.truthyMonkey : this.falsyMonkey;
            nextMonkey.catchItem(worry);
        }
    }

    catchItem(item) {
        this.items.push(item);
    }

    getItemsInspected() {
        return this.itemsInspected;
    }

    getTestDivisor() {
        return this.testDivisor;
    }

    setWorryClamp(worryClamp) {
        this.worryClamp = worryClamp;
    }
}

async function readInput(path) {
    const buffer = await fsPromises.readFile(path);
    return buffer.toString().split('\n');
}

function calculateMonkeyBusiness(input, rounds, useWorryDivisor) {
    const monkies = new Array((input.length + 1) / 7)
        .fill(true)
        .map((_, idx) => new Monkey(idx))
        .map((monkey, idx, monkies) => monkey.readInMonkeyConfig(input.slice(idx * 7, (idx * 7) + 7), monkies));

    const worryClamp = monkies
        .map(monkey => monkey.getTestDivisor())
        .reduce((worryClamp, testDivisor) => worryClamp * testDivisor);
    monkies.forEach(monkey => monkey.setWorryClamp(worryClamp));
        
    for (let round = 0; round < rounds; round++) {
        monkies.forEach(monkey => monkey.throwAllItems(useWorryDivisor));
    }

    monkies.sort((a, b) => b.getItemsInspected() - a.getItemsInspected());
    
    return monkies[0].getItemsInspected() * monkies[1].getItemsInspected();
}

async function run() {
    const input = await readInput('input.txt');
    const monkeyBusiness20 = calculateMonkeyBusiness(input, 20, true);
    console.log('20 rounds', monkeyBusiness20);
    const monkeyBusiness10000 = calculateMonkeyBusiness(input, 10000, false);
    console.log('10000 rounds', monkeyBusiness10000);
}

run();