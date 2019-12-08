import { Vector, VectorDir } from "../util/vector";
import { inputData } from "./data";


console.log(`Puzzle A solution: ${puzzleA()}`);
console.log(`Puzzle B solution: ${puzzleB()}`);

function puzzleA() {
    const [wire1, wire2] = splitInput(inputData)
        .map(mapWirePath);

    const intersections = new Set([...wire1.keys()].filter(x => wire2.has(x)));
    const closestIntersection = [...intersections].reduce((acc: number | null, val) => {
        const dist = calcManhattanDistanceFromOrigin(val);
        return acc === null || dist < acc ? dist : acc;
    }, null);
    return closestIntersection;
}

function puzzleB() {
    const [wire1, wire2] = splitInput(inputData)
        .map(mapWirePath);

    const intersections = new Set([...wire1.keys()].filter(x => wire2.has(x)));
    const closestIntersection = [...intersections].reduce((acc: number | null, val) => {
        const dist = wire1.get(val) + wire2.get(val);
        return acc === null || dist < acc ? dist : acc;
    }, null);
    return closestIntersection;
}

function splitInput(inputData: string): Vector[][] {
    return inputData.split('\n')
        .map(line => line.split(',').map(x => new Vector(x)));
}

function mapWirePath(vectors: Vector[]) {
    const path = new Map<string, number>();

    let x = 0,
        y = 0,
        steps = 0;

    vectors.forEach(vector => {
        let xDelta = 0,
            yDelta = 0;

        switch (vector.direction) {
            case VectorDir.Up:
                yDelta = 1;
                break;
            case VectorDir.Right:
                xDelta = 1;
                break;
            case VectorDir.Down:
                yDelta = -1;
                break;
            case VectorDir.Left:
                xDelta = -1;
                break;
        }

        for (let i = 0; i < vector.magnitude; i++) {
            x += xDelta;
            y += yDelta;
            steps++;
            path.set(`${x},${y}`, steps);
        }
    });

    return path;
}

function calcManhattanDistanceFromOrigin(coords: string) {
    const [x, y] = coords.split(',').map(x => Number(x));
    return Math.abs(x) + Math.abs(y);
}
