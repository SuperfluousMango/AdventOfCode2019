import { inputData } from './data';

console.log(`Puzzle A solution: ${puzzleA()}`);
console.log(`Puzzle B solution: ${puzzleB()}`);

function puzzleA() {
    return inputData.map(calcFuelUsage)
        .reduce((acc, val) => acc + val, 0);
}

function puzzleB() {
    return inputData.map(calcFuelUsageWithExtraFuel)
        .reduce((acc, val) => acc + val, 0);
}

function calcFuelUsage(moduleMass: number) {
    return Math.floor(moduleMass / 3) - 2;
}

function calcFuelUsageWithExtraFuel(moduleMass: number) {
    let baseFuel = calcFuelUsage(moduleMass);
    let totalFuel = baseFuel;

    let lastFuel = baseFuel;
    let fuelForFuel = calcFuelUsage(lastFuel);

    while (fuelForFuel > 0) {
        totalFuel += fuelForFuel;
        lastFuel = fuelForFuel;
        fuelForFuel = calcFuelUsage(lastFuel);
    }

    return totalFuel;
}
