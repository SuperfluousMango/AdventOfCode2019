import { inputData } from "./data";

const ROW_SIZE = 25,
    LAYER_SIZE = ROW_SIZE * 6;

console.log(`Puzzle A solution: ${puzzleA()}`);
console.log(`Puzzle B solution: ${puzzleB()}`);

function puzzleA() {
    const layers = splitInput(inputData),
        [_, layerIndexWithFewestZeroes] = layers.reduce(([fewestZeros, index], layer, curIdx) => {
            const zeroCount = getCharCount(layer, '0');
            if (fewestZeros === null || zeroCount < fewestZeros) {
                fewestZeros = zeroCount;
                index = curIdx;
            }
            return [fewestZeros, index];
        }, [null, null]);

    return getCharCount(layers[layerIndexWithFewestZeroes], '1') * getCharCount(layers[layerIndexWithFewestZeroes], '2');
}

function puzzleB() {
    const layers = splitInput(inputData),
        initAcc = '2'.repeat(LAYER_SIZE),
        mergedLayer = layers.reduce((acc, layer) => {
            let newAcc = '';
            for (let x = 0; x < LAYER_SIZE; x++) {
                newAcc = newAcc + (acc[x] === '2' ? layer[x] : acc[x]);
            }
            return newAcc;
        }, initAcc)
            .split('')
            .map(x => convertPixelToChar(x));

    let message: string[] = [];
    for (let x = 0; x < LAYER_SIZE; x += ROW_SIZE) {
        message.push(mergedLayer.slice(x, x + ROW_SIZE).join(''));
    }

    return '\n' + message.join('\n');
}

function splitInput(inputData: string) {
    const output: string[] = [];
    let x = 0;

    while (x < inputData.length) {
        output.push(inputData.slice(x, x + LAYER_SIZE));
        x += LAYER_SIZE;
    }

    return output;
}

function getCharCount(layer: string, char: string) {
    const replaceRegex = new RegExp(char, 'g');
    return layer.length - layer.replace(replaceRegex, '').length;
}

function convertPixelToChar(char: string) {
    switch (char) {
        case '0': return ' ';
        case '1': return 'X';
        default: return char;
    }
}
