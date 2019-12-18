import { inputData } from "./data";
import { IntcodeProcessor } from "../util/intcode-processor";
import { VectorDir } from "../util/vector";

const SEP_CHAR = ' ';
const SEP_CHAR_REGEX = new RegExp(SEP_CHAR, 'g');
const NEW_LINE_ASCII = '\n'.charCodeAt(0);

console.log(`Puzzle B solution: ${puzzleB()}`);

/*
 * I know zlib and other text compression libraries have to be doing something similar to this
 * (albeit much smarter and more performant), but I couldn't find a way in the admittedly short
 * time I spent looking into it to get the same results I did in the solve-it-by-hand approach.
 */
function puzzleB() {
    const program = splitInput(inputData)
    program[0] = 2; // From instructions

    const processor = new IntcodeProcessor(program),
        outputBuffer: number[] = [];
    processor.outputHandler = val => outputBuffer.push(val);
    processor.runProgram();

    const mapRows = convertOutputToMap(outputBuffer),
        movementInstructions = buildInstructionList(mapRows),
        routines = findRoutines(movementInstructions);

    const routineSearchRegex = new RegExp(routines.join('|'), 'g');
    let mainRoutineCalls: string[] = [],
        searchResult: RegExpExecArray;
    do {
        searchResult = routineSearchRegex.exec(movementInstructions);
        if (searchResult) {
            switch (searchResult[0]) {
                case routines[0]:
                    mainRoutineCalls.push('A');
                    break;
                case routines[1]:
                    mainRoutineCalls.push('B');
                    break;
                case routines[2]:
                    mainRoutineCalls.push('C');
                    break;
            }
        }
    } while (searchResult)

    const mainRoutine = mainRoutineCalls.join(','),
        routineA = routines[0].replace(SEP_CHAR_REGEX, ','),
        routineB = routines[1].replace(SEP_CHAR_REGEX, ','),
        routineC = routines[2].replace(SEP_CHAR_REGEX, ',');

    processor.inputBuffer.push(
        ...prepareInput(mainRoutine),
        ...prepareInput(routineA),
        ...prepareInput(routineB),
        ...prepareInput(routineC),
        ...prepareInput('n') // We don't want a live video feed
    );
    processor.outputHandler = null; // don't process the output
    processor.runProgram();
    return processor.outputVal;
}

function splitInput(inputData: string) {
    return inputData.split(',')
        .map(x => Number(x));
}

function convertOutputToMap(output: number[]) {
    return output.map(x => String.fromCharCode(x))
        .join('')
        .split('\n');
}

function buildInstructionList(mapRows: string[]) {
    let x: number,
        y: number;
    for (y = 0; y < mapRows.length; y++) {
        let idx = mapRows[y].indexOf('^')
        if (idx > -1) {
            x = idx;
            break; // y is already set by the iterator
        }
    }

    let dir = VectorDir.Up,
        steps = 0,
        instructions: string[] = [];
    while (true) {
        let [newX, newY, newDir] = getNextPos(mapRows, x, y, dir);
        if (isNaN(newX) && isNaN(newY)) {
            instructions.push(steps.toString());
            break;
        }

        if (newDir === dir) {
            x = newX;
            y = newY;
            steps++;
        } else {
            if (steps > 0) {
                instructions.push(steps.toString());
            }
            instructions.push(getTurnInstruction(dir, newDir));
            dir = newDir;
            steps = 0;
        }
    }

    return instructions.join(SEP_CHAR);
}

function getNextPos(mapRows: string[], x: number, y: number, dir: VectorDir) {
    // Try moving forward
    switch (dir) {
        case VectorDir.Up:
            if (y > 0 && mapRows[y - 1][x] === '#') return [x, y - 1, dir];
            break;
        case VectorDir.Right:
            if (x < mapRows[0].length && mapRows[y][x + 1] === '#') return [x + 1, y, dir];
            break;
        case VectorDir.Down:
            if (y < mapRows.length && mapRows[y + 1][x] === '#') return [x, y + 1, dir];
            break;
        case VectorDir.Left:
            if (x > 0 && mapRows[y][x - 1] === '#') return [x - 1, y, dir];
            break;
    }

    // Try turning - there should only ever be a single option, because we go straight at intersections
    switch (dir) {
        case VectorDir.Up:
        case VectorDir.Down:
            if (x > 0 && mapRows[y][x - 1] === '#') return [x, y, VectorDir.Left];
            if (x < mapRows[0].length && mapRows[y][x + 1] === '#') return [x, y, VectorDir.Right];
            break;
        case VectorDir.Left:
        case VectorDir.Right:
            if (y > 0 && mapRows[y - 1][x] === '#') return [x, y, VectorDir.Up];
            if (y < mapRows.length && mapRows[y + 1][x] === '#') return [x, y, VectorDir.Down];
            break;
    }

    // Couldn't go straight and couldn't turn - we're done
    return [NaN, NaN, dir];
}

function getTurnInstruction(oldDir: VectorDir, newDir: VectorDir) {
    return (newDir === oldDir + 1 || (oldDir === VectorDir.Left && newDir === VectorDir.Up))
        ? 'R'
        : 'L';
}

function findRoutines(movementInstructions: string) {

    // Look for repeated strings
    const routines: string[] = [],
        maxRoutineLength = 20,
        badMatches = new Set<string>();
    let pos = 0,
        testLength = 0,
        workingCopyOfInstructions = movementInstructions,
        done = false,
        curTest: string;
    do {
        // Make sure we're not starting on a separator character
        if (workingCopyOfInstructions.substr(pos, 1) === SEP_CHAR) {
            pos++;
            continue;
        }

        testLength++;
        curTest = workingCopyOfInstructions.substr(pos, testLength);
        const regex = new RegExp(curTest, 'g'),
            matches = workingCopyOfInstructions.match(regex) || [];
        if (matches.length > 1) {
            // The substring appears more than once - make it larger and try again
            continue;
        }
        curTest = curTest.slice(0, -1); // The last character caused us not to match - drop it

        // No matches - shrink the string until it is < 20 characters and ends in a space (so we're on a boundary between instructions)
        while (curTest.length > maxRoutineLength || curTest.substr(-1) !== SEP_CHAR || badMatches.has(curTest)) {
            curTest = curTest.slice(0, -1); // chop off the last character
            if (curTest.length === 0) break;
        }

        // Chop off the separator character(s) at the end
        while (curTest.substr(-1) === SEP_CHAR) {
            badMatches.add(curTest); // If we have to try again, we don't want to match on any of these
            curTest = curTest.slice(0, -1);
        }

        // Save the substring as a routine
        routines.push(curTest);

        // Replace our substring with characters we're not using, so we don't inadvertently overlap
        workingCopyOfInstructions = workingCopyOfInstructions.replace(new RegExp(curTest, 'g'), SEP_CHAR.repeat(curTest.length));
        testLength = 0;

        if (workingCopyOfInstructions.replace(SEP_CHAR_REGEX, '').length === 0) {
            done = true;
        } else if (routines.length === 3) {
            // We found 3 matches, but we didn't replace everything. Make the
            // assumption that none of our three matches are good, and try
            // again. :( This might be a bad assumption for some inputs, but it
            // turns out to work just fine for mine.
            routines.forEach(m => badMatches.add(m));
            routines.length = 0;
            workingCopyOfInstructions = movementInstructions;
            pos = 0;
        }
    } while (!done);

    return routines;
}

function prepareInput(input: string) {
    return input.split('')
        .map(c => c.charCodeAt(0))
        .concat(NEW_LINE_ASCII);
}
