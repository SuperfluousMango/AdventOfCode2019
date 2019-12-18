import { inputData } from "./data";
import { IntcodeProcessor } from "../util/intcode-processor";

console.log(`Puzzle A solution: ${puzzleA()}`);
console.log(`Puzzle B solution: ${puzzleB()}`);

function puzzleA() {
    const program = splitInput(inputData),
        processor = new IntcodeProcessor(program),
        output: number[] = [];

    processor.inputBuffer.push(1); // from instructions
    processor.outputHandler = (val) => output.push(val);

    processor.runProgram();
    return output.join(',');
}

function puzzleB() {
    const program = splitInput(inputData),
        processor = new IntcodeProcessor(program),
        output: number[] = [];

    processor.inputBuffer.push(2); // from instructions
    processor.outputHandler = (val) => output.push(val);

    processor.runProgram();
    return output.join(',');
}

function splitInput(inputData: string) {
    return inputData.split(',')
        .map(x => Number(x));
}
