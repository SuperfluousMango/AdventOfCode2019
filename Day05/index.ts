import { inputData } from "./data";
import { IntcodeProcessor } from "../util/intcode-processor";

console.log(`Puzzle A solution: ${puzzleA()}`);
console.log(`Puzzle B solution: ${puzzleB()}`);

function puzzleA() {
    const program = splitInput(inputData);

    const processor = new IntcodeProcessor(program);
    processor.inputVal = 1; // specified by instructions
    processor.runProgram();
    return processor.outputVal;
}

function puzzleB() {
    const program = splitInput(inputData);

    const processor = new IntcodeProcessor(program);
    processor.inputVal = 5; // specified by instructions
    processor.runProgram();
    return processor.outputVal;
}

function splitInput(inputData: string) {
    return inputData.split(',')
        .map(x => Number(x));
}
