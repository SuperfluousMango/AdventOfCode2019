import { inputData } from "./data";
import { Point } from "../util/point";

console.log(`Puzzle A solution: ${puzzleA()}`);
console.log(`Puzzle B solution: ${puzzleB()}`);

function puzzleA() {
    const asteroidList = splitInput(inputData),
        asteroidVisibilityList: Set<number>[] = [];

    for (let i = 0; i < asteroidList.length; i++) {
        if (!asteroidVisibilityList[i]) {
            asteroidVisibilityList[i] = new Set<number>();
        }
        const point1 = asteroidList[i];
        for (let j = i + 1; j < asteroidList.length; j++) {
            if (!asteroidVisibilityList[j]) {
                asteroidVisibilityList[j] = new Set<number>();
            }

            const point2 = asteroidList[j],
                angleFrom1To2 = point1.calcAngleToPoint(point2),
                angleFrom2To1 = angleFrom1To2 === 0 ? 180 : angleFrom1To2 - 180;

            asteroidVisibilityList[i].add(angleFrom1To2);
            asteroidVisibilityList[j].add(angleFrom2To1);
        }
    }

    const [maxVisibleAsteroids, maxVisibleIndex] = asteroidVisibilityList.reduce(([maxVisibleAsteroids, maxVisibleIndex], list, idx) => {
        if (list.size > maxVisibleAsteroids) {
            maxVisibleAsteroids = list.size;
            maxVisibleIndex = idx;
        }
        return [maxVisibleAsteroids, maxVisibleIndex];
    }, [0, null]);

    return [maxVisibleAsteroids, asteroidList[maxVisibleIndex].toString()];
}

function puzzleB() {
    const ASTEROIDS_TO_SHOOT = 200;

    const basePoint = new Point(13, 17), // Learned from part A
        asteroidsByAngle = splitInput(inputData)
            .filter(val => val.x !== basePoint.x || val.y !== basePoint.y)
            .reduce((acc, val) => {
                const angleToAsteroid = basePoint.calcAngleToPoint(val, true);
                if (!acc.has(angleToAsteroid)) {
                    acc.set(angleToAsteroid, []);
                }
                acc.get(angleToAsteroid).push(val);
                return acc;
            }, new Map<number, Point[]>())

    // Sort each list internally by closest to the base (first to be shot), then sort the lists by compass angle (clockwise)
    asteroidsByAngle.forEach(list => list.sort((a, b) => basePoint.calcManhattanDistanceToPoint(a) - basePoint.calcManhattanDistanceToPoint(b)));
    const sortedAngles = [...asteroidsByAngle.keys()].sort((a, b) => a - b),
        asteroidsInShotOrder: Point[] = [];
    let angleIndex = 0;

    while (sortedAngles.length) {
        const asteroidsAtCurrentAngle = asteroidsByAngle.get(sortedAngles[angleIndex]);
        if (asteroidsAtCurrentAngle.length) {
            asteroidsInShotOrder.push(asteroidsAtCurrentAngle.shift());
            angleIndex++;
        } else {
            sortedAngles.splice(angleIndex, 1);
            // Don't increment index because we just removed the current one
        }

        if (angleIndex >= sortedAngles.length) {
            angleIndex = 0;
        }
    }

    const betWinningAsteroid = asteroidsInShotOrder[ASTEROIDS_TO_SHOOT - 1];
    return betWinningAsteroid.x * 100 + betWinningAsteroid.y;
}

function splitInput(inputData: string) {
    return inputData.split('\n')
        .reduce((acc, val, idx) => {
            for (let x = 0; x <= val.length; x++) {
                if (val[x] === '#') {
                    acc.push(new Point(x, idx));
                }
            }
            return acc;
        }, [] as Point[]);
}