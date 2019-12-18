import { inputData } from "./data";
import { IntcodeProcessor } from "../util/intcode-processor";
import { permutation } from "js-combinatorics";

console.log(`Puzzle A solution: ${puzzleA()}`);
console.log(`Puzzle B solution: ${puzzleB()}`);

function puzzleA() {
    const program = splitInput(inputData),
        processor = new IntcodeProcessor(program),
        phaseValues = [0, 1, 2, 3, 4],
        phasePermutations = permutation(phaseValues, phaseValues.length);

    let maxThrusterSignal = 0,
        permutationCount = 0,
        curPhaseList: number[],
        lastOutput: number;

    while (curPhaseList = phasePermutations.next()) {
        permutationCount++;
        lastOutput = 0;

        curPhaseList.forEach(phase => {
            processor.resetProgram();

            try {
                processor.inputBuffer.push(phase);
                processor.runProgram();
                processor.inputBuffer.push(lastOutput);
                processor.runProgram();
                if (processor.outputVal === null) {
                    throw new Error(`Unexpected null output`);
                }
            } catch (e) {
                throw new Error(`${permutationCount} permutations, curPhaseList ${curPhaseList}, phase ${phase}, lastOutput ${lastOutput}\n${e.message}`);
            }
            lastOutput = processor.outputVal;
        });

        if (lastOutput > maxThrusterSignal) {
            maxThrusterSignal = lastOutput;
        }
    }

    return maxThrusterSignal;
}

function puzzleB() {
    const program = splitInput(inputData),
        processors = [
            new IntcodeProcessor(program),
            new IntcodeProcessor(program),
            new IntcodeProcessor(program),
            new IntcodeProcessor(program),
            new IntcodeProcessor(program)
        ],
        phaseValues = [5, 6, 7, 8, 9],
        phasePermutations = permutation(phaseValues, phaseValues.length);

    let maxThrusterSignal = 0,
        permutationCount = 0,
        curPhaseList: number[];

    while (curPhaseList = phasePermutations.next()) {
        let index = 0,
            halted = false;
        permutationCount++;

        processors.forEach(p => p.resetProgram());
        curPhaseList.forEach((phase, idx) => processors[idx].inputBuffer.push(phase)); // set phases

        // Run all amplifiers enough to process initial (phase) input
        processors.forEach(p => p.runProgram());
        processors[0].inputBuffer.push(0); // from instructions

        while (!(halted && index === 0)) {
            try {
                const result = processors[index].runProgram(),
                    outVal = processors[index].outputVal;
                halted = halted || result !== undefined; // OpCode.END returns the value at program[0], but pausing for input does not

                index++;
                if (index >= processors.length) {
                    index = 0;
                }

                if (outVal !== null) {
                    processors[index].inputBuffer.push(outVal);
                }
            } catch (e) {
                throw new Error(`${permutationCount} permutations, curPhaseList ${curPhaseList}, index ${index}\n${e.message}`);
            }
        }

        const lastOutputFromAmplifierE = processors[4].outputVal;
        if (lastOutputFromAmplifierE > maxThrusterSignal) {
            maxThrusterSignal = lastOutputFromAmplifierE;
        }
    }

    return maxThrusterSignal;
}

function splitInput(inputData: string) {
    return inputData.split(',')
        .map(x => Number(x));
}
