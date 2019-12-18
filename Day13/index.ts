import { inputData } from "./data";
import { IntcodeProcessor } from "../util/intcode-processor";
import { TileId } from "./tile-id";

console.log(`Puzzle A solution: ${puzzleA()}`);
console.log(`Puzzle B solution: ${puzzleB()}`);

function puzzleA() {
    const program = splitInput(inputData),
        processor = new IntcodeProcessor(program),
        outputBuffer: number[] = [];

    processor.outputHandler = val => outputBuffer.push(val);
    processor.runProgram();

    let blockCount = 0;
    while (outputBuffer.length) {
        const x = outputBuffer.shift(),
            y = outputBuffer.shift(),
            tileId: TileId = outputBuffer.shift();
        if (tileId === TileId.Block) {
            blockCount++;
        }
    }

    return blockCount;
}

function puzzleB() {
    const program = splitInput(inputData);
    program[0] = 2; // 1337 HAXX0RZ PLAY 4 FREE!!!!!!!!!!!!!SHIFT-ONE

    const processor = new IntcodeProcessor(program),
        outputBuffer: number[] = [];

    processor.outputHandler = val => outputBuffer.push(val);

    let score = 0,
        halted = false,
        ballX: number,
        paddleX: number;
    while (!halted) {
        const result = processor.runProgram();
        while (outputBuffer.length) {
            // This time we don't care about blocks or any of that crap;
            // we just want to track the ball and the paddle
            const x = outputBuffer.shift(),
                y = outputBuffer.shift();

            if (x === -1 && y === 0) {
                score = outputBuffer.shift();
            } else {
                const tileId = outputBuffer.shift();
                if (tileId === TileId.Paddle) {
                    ballX = x;
                } else if (tileId === TileId.Ball) {
                    paddleX = x;
                }
            }
        }

        // Updated the game board; see if the game is over
        if (result === undefined) {
            processor.inputBuffer.push(Math.sign(paddleX - ballX));
        } else {
            halted = true;
        }
    }

    return score;
}

function splitInput(inputData: string) {
    return inputData.split(',')
        .map(x => Number(x));
}
