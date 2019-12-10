import { inputData } from "./data";
import { IntcodeProcessor } from "../util/intcode-processor";

console.log(`Puzzle A solution: ${puzzleA()}`);
console.log(`Puzzle B solution: ${puzzleB()}`);

function puzzleA() {
    const program = splitInput(inputData);
    // const program = splitInput('1002,4,3,4,33');

    const processor = new IntcodeProcessor(program);
    processor.inputVal = 1;
    processor.runProgram();
    return processor.outputVal;
}

function puzzleB() {
    const program = splitInput(inputData);
    const processor = new IntcodeProcessor(program);
}

function splitInput(inputData: string) {
    return inputData.split(',')
        .map(x => Number(x));
}
