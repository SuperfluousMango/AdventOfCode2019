import { inputData } from "./data";

const BASE_PATTERN = [0, 1, 0, -1];

console.log(`Puzzle A solution: ${puzzleA()}`);
console.log(`Puzzle B solution: ${puzzleB()}`);

function puzzleA() {
    let input = inputData.split('')
        .map(x => Number(x)),
        output: number[] = [],
        phase: number;

    const maxPhases = 100;

    for (phase = 0; phase < maxPhases; phase++) {
        output = [];

        for (let x = 0; x < input.length; x++) {
            let pattern = buildPattern(x + 1, input.length);
            output[x] = Number(
                input.reduce((acc, val, idx) => {
                    return acc + (pattern[idx] * val);
                }, 0)
                    .toString()
                    .slice(-1)
            );
        }

        input = output;
    }

    return input.slice(0, 8)
        .join('');
}

function puzzleB() {
    let origInput = inputData,
        messageOffset = Number(origInput.slice(0, 7)),
        repeatedInput = origInput.repeat(10000),
        input = repeatedInput.slice(messageOffset)
            .split('')
            .map(x => Number(x)),
        output: number[],
        phase: number;

    const maxPhases = 100;

    // Many credits to the subreddit, without which I wouldn't have stumbled onto this solution
    input.reverse(); // We want to process from the end number, anyway, so this makes it easier
    for (phase = 0; phase < maxPhases; phase++) {
        output = [];

        input.forEach((val, idx) => {
            output[idx] = idx === 0
                ? val
                : (output[idx - 1] + val) % 10;
        });

        input = output;
    }

    return input.reverse() // Undo our reverse from earlier
        .slice(0, 8)
        .join('');
}

function buildPattern(iteration: number, requiredLength: number) {
    let pattern: number[] = Array(requiredLength + 1),
        pos = 0,
        count = 0;
    while (count < requiredLength + 1) {
        pattern.fill(BASE_PATTERN[pos], count, count + iteration);
        pos++;
        if (pos === BASE_PATTERN.length) {
            pos = 0;
        }
        count += iteration;
    }

    // Always drop the first value of the pattern, because that makes total
    // sense. Also, because that's what the instructions say to do.
    pattern.shift();
    return pattern;
}
