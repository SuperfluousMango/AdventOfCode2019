const MIN_VALUE = 372037;
const MAX_VALUE = 905157;

console.log(`Puzzle A solution: ${puzzleA()}`);
console.log(`Puzzle B solution: ${puzzleB()}`);

function puzzleA() {
    let validPasswordCount = 0;

    for (let i = MIN_VALUE; i <= MAX_VALUE; i++) {
        const val = i.toString();

        if (hasAdjacentRepeatingDigits(val) && hasNoDecreasingDigits(val)) {
            validPasswordCount++;
        }
    }

    return validPasswordCount;
}

function puzzleB() {
    let validPasswordCount = 0;

    for (let i = MIN_VALUE; i <= MAX_VALUE; i++) {
        const val = i.toString();

        if (hasAdjacentRepeatingDigits(val) && hasNoDecreasingDigits(val) && hasDoubledRepeatingDigits(val)) {
            validPasswordCount++;
        }
    }

    return validPasswordCount;
}

function hasAdjacentRepeatingDigits(val: string) {
    return val[0] === val[1] ||
        val[1] === val[2] ||
        val[2] === val[3] ||
        val[3] === val[4] ||
        val[4] === val[5];
}

function hasNoDecreasingDigits(val: string) {
    return val[0] <= val[1] &&
        val[1] <= val[2] &&
        val[2] <= val[3] &&
        val[3] <= val[4] &&
        val[4] <= val[5];
}

function hasDoubledRepeatingDigits(val: string) {
    const doubledDigitRegex = /(\d)\1/g,    // Any digit repeated once
        tripledDigitRegex = /(\d)\1{2}/g;   // Any digit repeated twice (or more, but that will already be covered by this case)

    let doubledDigits = new Set(getRegexStringMatches(val, doubledDigitRegex).map(match => match[0])), // grab the first digit of each repeating group
        tripledDigits = new Set(getRegexStringMatches(val, tripledDigitRegex).map(match => match[0]));
    // console.log(val, doubledDigits, tripledDigits);

    return doubledDigits.size > tripledDigits.size; // We had at least one doubled digit that was not tripled
}

function getRegexStringMatches(str: string, regex: RegExp) {
    return str.match(regex) || [];
}