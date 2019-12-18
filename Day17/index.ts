import { inputData } from "./data";
import { IntcodeProcessor } from "../util/intcode-processor";

console.log(`Puzzle A solution: ${puzzleA()}`);
console.log(`Puzzle B solution: ${puzzleB()}`);

function puzzleA() {
    const program = splitInput(inputData),
        mapRows = buildMap(program);

    let alignmentParameterSum = 0;
    // We can ignore the edges, because they can't have an intersection
    for (let y = 1; y < mapRows.length - 1; y++) {
        const row = mapRows[y];
        for (let x = 1; x < row.length - 1; x++) {
            if (row[x - 1] === '#' && row[x] === '#' && row[x + 1] === '#' && mapRows[y - 1][x] === '#' && mapRows[y + 1][x] === '#') {
                alignmentParameterSum += x * y;
            }
        }
    }

    return alignmentParameterSum;
}

function puzzleB() {
    const program = splitInput(inputData)

    program[0] = 2; // From instructions
    const processor = new IntcodeProcessor(program),
        mainRoutine = 'A,B,A,B,A,C,B,C,A,C\n',
        routineA = 'L,10,L,12,R,6\n',
        routineB = 'R,10,L,4,L,4,L,12\n',
        routineC = 'L,10,R,10,R,6,L,4\n',
        videoFeedOption = 'n\n',
        combinedString = mainRoutine + routineA + routineB + routineC + videoFeedOption,
        inputs = combinedString.split('')
            .map(x => x.charCodeAt(0));

    processor.inputBuffer.push(...inputs);
    const outputBuffer: number[] = [];
    processor.outputHandler = val => outputBuffer.push(val);

    processor.runProgram();
    // Program seems to spit out a map at the start whether I want one or not
    // This is probably because we were supposed to solve this programmatically or something,
    // by following the generated path and looking for repeated patterns rather than solving
    // it by hand. Zip algorithm or something, I guess? ¯\_(ツ)_/¯
    return outputBuffer.pop();
}

function splitInput(inputData: string) {
    return inputData.split(',')
        .map(x => Number(x));
}

function buildMap(program: number[]) {
    const processor = new IntcodeProcessor(program),
        outputBuffer: number[] = [];

    processor.outputHandler = val => outputBuffer.push(val);
    processor.runProgram();
    return convertOutputToMap(outputBuffer);
}

function convertOutputToMap(output: number[]) {
    return output.map(x => String.fromCharCode(x))
        .join('')
        .split('\n');
}