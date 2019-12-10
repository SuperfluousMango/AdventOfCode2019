import { inputData } from "./data";

const YOU_SYMBOL = 'YOU',
    SANTA_SYMBOL = 'SAN';

console.log(`Puzzle A solution: ${puzzleA()}`);
console.log(`Puzzle B solution: ${puzzleB()}`);

function puzzleA() {
    const orbitMap = splitInput(inputData);
    return [...orbitMap.values()].reduce((acc, val) => {
        let indirectOrbits = 0,
            orbiter = val;
        while (orbiter = orbitMap.get(orbiter)) {
            indirectOrbits++;
        }

        return acc + indirectOrbits;
    }, orbitMap.size);
}

function puzzleB() {
    const orbitMap = splitInput(inputData),
        yourPathToCenter = pathToCenter(orbitMap, YOU_SYMBOL),
        santaPathToCenter = pathToCenter(orbitMap, SANTA_SYMBOL);

    let yourSteps = 0,
        yourPathArray = [...yourPathToCenter];
    for (let i = 0; i < yourPathToCenter.size; i++) {
        if (santaPathToCenter.has(yourPathArray[i])) {
            break;
        }
        yourSteps++;
    }

    let santaSteps = 0,
        santaPathArray = [...santaPathToCenter];
    for (let i = 0; i < santaPathToCenter.size; i++) {
        if (yourPathToCenter.has(santaPathArray[i])) {
            break;
        }
        santaSteps++;
    }

    return yourSteps + santaSteps;
}

function splitInput(inputData: string) {
    return inputData.split('\n')
        .map(x => x.split(')'))
        .reduce((acc, val) => {
            const [center, orbiter] = val;
            acc.set(orbiter, center);
            return acc;
        }, new Map<string, string>());
}

function pathToCenter(orbitMap: Map<string, string>, start: string) {
    let curNode = start,
        path = new Set<string>(),
        innerNode: string;

    while (innerNode = orbitMap.get(curNode)) {
        path.add(innerNode);
        curNode = innerNode;
    }

    return path;
}
