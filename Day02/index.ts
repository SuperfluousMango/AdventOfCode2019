import { inputData } from "./data";
import { IntcodeProcessor } from "../util/intcode-processor";

console.log(`Puzzle A solution: ${puzzleA()}`);
console.log(`Puzzle B solution: ${puzzleB()}`);

function puzzleA() {
    const program = splitInput(inputData);
    // Make replacements dictated by the instructions
    program[1] = 12;
    program[2] = 2;

    const processor = new IntcodeProcessor(program);
    return processor.runProgram();
}

function puzzleB() {
    const DESIRED_OUTPUT = 19690720;
    const program = splitInput(inputData);
    const processor = new IntcodeProcessor(program);

    for (let replacement1 = 0; replacement1 < 100; replacement1++) {
        for (let replacement2 = 0; replacement2 < 100; replacement2++) {
            processor.resetProgram()
                .setValue(1, replacement1)
                .setValue(2, replacement2);

            const output = processor.runProgram();
            if (output === DESIRED_OUTPUT) {
                return `${replacement1.toString().padStart(2, '0')}${replacement2.toString().padStart(2, '0')}`;
            }
        }
    }
}

function splitInput(inputData: string) {
    return inputData.split(',')
        .map(x => Number(x));
}