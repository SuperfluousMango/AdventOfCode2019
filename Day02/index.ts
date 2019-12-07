import { inputData } from "./data";

const OPCODE_ADD = 1;
const OPCODE_MUL = 2;
const OPCODE_END = 99;

console.log(`Puzzle A solution: ${puzzleA()}`);
console.log(`Puzzle B solution: ${puzzleB()}`);

function puzzleA() {
    const program = splitInput(inputData);
    // Make replacements dictated by the instructions
    program[1] = 12;
    program[2] = 2

    runProgram(program);

    return program[0];
}

function puzzleB() {
    const DESIRED_OUTPUT = 19690720;
    const origInput = splitInput(inputData);

    for (let replacement1 = 0; replacement1 < 100; replacement1++) {
        for (let replacement2 = 0; replacement2 < 100; replacement2++) {
            const program = [...origInput];
            program[1] = replacement1;
            program[2] = replacement2;
            runProgram(program);

            if (program[0] === DESIRED_OUTPUT) {
                return `${replacement1.toString().padStart(2, '0')}${replacement2.toString().padStart(2, '0')}`;
            }
        }
    }
}

function splitInput(inputData: string) {
    return inputData.split(',')
        .map(x => Number(x));
}

function runProgram(program: number[]) {
    let instructionPtr = 0;

    do {
        const opCode = program[instructionPtr],
            params = getParamsForOpcode(opCode, program, instructionPtr);

        switch (opCode) {
            case OPCODE_ADD:
                // Parameters:
                // [0] - input pos 1
                // [1] - input pos 2
                // [2] - target pos
                program[params[2]] = program[params[0]] + program[params[1]];
                break;
            case OPCODE_MUL:
                // Parameters:
                // [0] - input pos 1
                // [1] - input pos 2
                // [2] - target pos
                program[params[2]] = program[params[0]] * program[params[1]];
                break;
            case OPCODE_END:
                return;
            default:
                throw new Error(`Unexpected opcode ${opCode} encountered at pos ${instructionPtr}`);
        }

        instructionPtr += params.length + 1; // number of parameters, plus one for the opcode
    } while (instructionPtr <= program.length);
}

function getParamsForOpcode(opCode: number, program: number[], instructionPtr: number): number[] {
    switch (opCode) {
        case OPCODE_ADD:
        case OPCODE_MUL:
            return program.slice(instructionPtr + 1, instructionPtr + 4);
        case OPCODE_END:
            return [];
        default:
            throw new Error(`Unexpected opcode ${opCode} encountered at pos ${instructionPtr}`);
    }
}