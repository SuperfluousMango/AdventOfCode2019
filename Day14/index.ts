import { inputData } from "./data";
import { Ingredient } from "./ingredient";

const FUEL_SYMBOL = 'FUEL',
    ORE_SYMBOL = 'ORE';

console.log(`Puzzle A solution: ${puzzleA()}`);
console.log(`Puzzle B solution: ${puzzleB()}`);

function puzzleA() {
    const ingredientHash = splitInput(inputData),
        fuel = ingredientHash.get(FUEL_SYMBOL),
        ore = ingredientHash.get(ORE_SYMBOL);

    fuel.requestIngredient(1);
    return ore.totalRequested;
}

function puzzleB() {
    const ingredientHash = splitInput(inputData),
        fuel = ingredientHash.get(FUEL_SYMBOL),
        ore = ingredientHash.get(ORE_SYMBOL),
        oneTrillion = 1_000_000_000_000;

    let totalFuelCreated = 0,
        fuelCreatedThisIteration: number,
        orePerFuel: number;

    fuel.requestIngredient(1);
    totalFuelCreated++;
    orePerFuel = ore.totalRequested;

    do {
        let remainingOre = oneTrillion - ore.totalRequested;
        fuelCreatedThisIteration = Math.floor(remainingOre / orePerFuel);
        fuel.requestIngredient(fuelCreatedThisIteration);
        totalFuelCreated += fuelCreatedThisIteration;
    } while (fuelCreatedThisIteration > 0)

    return totalFuelCreated;
}

function splitInput(inputData: string) {
    const hash = new Map<string, Ingredient>();
    hash.set(ORE_SYMBOL, new Ingredient(ORE_SYMBOL, 1)); // ORE is always present and doesn't require any reactants

    inputData.split('\n')
        .map(row => {
            const [inputs, output] = row.split(' => '),
                outputParts = output.split(' '),
                ingredient = new Ingredient(outputParts[1], Number(outputParts[0]));
            hash.set(ingredient.name, ingredient);
            return [inputs, ingredient] as [string, Ingredient];
        })
        .forEach(([inputs, ingredient]) => {
            inputs.split(', ')
                .forEach(input => {
                    const [count, name] = input.split(' ');
                    ingredient.addReactant({ ingredient: hash.get(name), count: Number(count) });
                });
        });
    return hash;
}
