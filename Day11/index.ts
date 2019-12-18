import { inputData } from "./data";
import { IntcodeProcessor } from "../util/intcode-processor";
import { VectorDir } from "../util/vector";

console.log(`Puzzle A solution: ${puzzleA()}`);
console.log(`Puzzle B solution: ${puzzleB()}`);

function puzzleA() {
    const program = splitInput(inputData),
        processor = new IntcodeProcessor(program);

    processor.inputBuffer.push(0); // All of the panels are currently black
    const paintCoords = paintHull(processor);

    return paintCoords.size;
}

function puzzleB() {
    const program = splitInput(inputData),
        processor = new IntcodeProcessor(program);

    processor.inputBuffer.push(1); // Start it on a single white square
    const paintCoords = paintHull(processor);

    // experimentation showed my input, at least, doesn't generate any negative numbers, so no need to offset those
    const paintArrays: string[][] = [];
    paintCoords.forEach((val, key) => {
        const [x, y] = key.split(',').map(coord => Number(coord));
        if (!paintArrays[y]) {
            paintArrays[y] = [];
        }
        paintArrays[y][x] = val === 1 ? 'X' : ' ';
    });

    // Some spots weren't touched by the robot, so fill them in as still black
    for (let y = 0; y < paintArrays.length; y++) {
        for (let x = 0; x < paintArrays[y].length; x++) {
            if (paintArrays[y][x] === undefined) {
                paintArrays[y][x] = ' ';
            }
        }
    }

    return '\n' + paintArrays.map(row => row.join(''))
        .join('\n');
}

function splitInput(inputData: string) {
    return inputData.split(',')
        .map(x => Number(x));
}

function paintHull(processor: IntcodeProcessor) {
    const paintCoords = new Map<string, number>(),
        outputVals: number[] = [],
        outputHandler = (val: number) => {
            outputVals.push(val);
        };

    let halted = false,
        x = 0,
        y = 0,
        curDir = VectorDir.Up;

    processor.outputHandler = outputHandler;
    while (!halted) {
        let output = processor.runProgram();
        if (output === undefined) {
            // Paused for additional input - process existing output
            let paintColor = outputVals.shift();
            paintCoords.set(`${x},${y}`, paintColor);
            curDir = outputVals.shift() === 0 ? rotateLeft(curDir) : rotateRight(curDir);
            [x, y] = moveForward(x, y, curDir);
            let newInput = paintCoords.get(`${x},${y}`);
            processor.inputBuffer = newInput === undefined ? 0 : newInput;
        } else {
            halted = true;
        }
    }

    return paintCoords;
}

function rotateLeft(curDir: VectorDir) {
    switch (curDir) {
        case VectorDir.Up: return VectorDir.Left;
        case VectorDir.Left: return VectorDir.Down;
        case VectorDir.Down: return VectorDir.Right;
        case VectorDir.Right: return VectorDir.Up;
    }
}

function rotateRight(curDir: VectorDir) {
    switch (curDir) {
        case VectorDir.Up: return VectorDir.Right;
        case VectorDir.Left: return VectorDir.Up;
        case VectorDir.Down: return VectorDir.Left;
        case VectorDir.Right: return VectorDir.Down;
    }
}

function moveForward(x: number, y: number, dir: VectorDir) {
    switch (dir) {
        case VectorDir.Up:
            y--;
            break;
        case VectorDir.Down:
            y++;
            break;
        case VectorDir.Right:
            x++;
            break;
        case VectorDir.Left:
            x--;
            break;
    }

    return [x, y];
}