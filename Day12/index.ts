import { inputData } from "./data";
import { Point3D } from "../util/point-3d";
import { Vector3D } from "../util/vector-3d";
import { BodyInSpace } from "../util/body-in-space";
import { lcm } from "mathjs";

console.log(`Puzzle A solution: ${puzzleA()}`);
console.log(`Puzzle B solution: ${puzzleB()}`);

function puzzleA() {
    const moonList = splitInput(inputData);

    let steps = 0;
    while (steps < 1000) {
        moonList.forEach(moon => adjustVelocity(moon, moonList));
        moonList.forEach(moon => moon.updateLocation());
        steps++;
    }

    return moonList.reduce((acc, val) => acc + (val.calcPotentialEnergy() * val.calcKineticEnergy()), 0);
}

function puzzleB() {
    const moonList = splitInput(inputData);

    let steps = 0,
        xPeriod, yPeriod, zPeriod;
    while (!xPeriod || !yPeriod || !zPeriod) {
        moonList.forEach(moon => adjustVelocity(moon, moonList));
        moonList.forEach(moon => moon.updateLocation());
        steps++;

        if (moonList.every(moon => moon.velocity.xDelta === 0)) {
            // All X velocities are back to zero - some sort of period
            if (!xPeriod || steps / xPeriod !== Math.floor(steps / xPeriod)) {
                // Not an exact multiple of the previous period - it could be a larger one
                xPeriod = steps;
            }
        }
        if (moonList.every(moon => moon.velocity.yDelta === 0)) {
            // All Y velocities are back to zero - some sort of period
            if (!yPeriod || steps / yPeriod !== Math.floor(steps / yPeriod)) {
                // Not an exact multiple of the previous period - it could be a larger one
                yPeriod = steps;
            }
        }
        if (moonList.every(moon => moon.velocity.zDelta === 0)) {
            // All Z velocities are back to zero - some sort of period
            if (!zPeriod || steps / zPeriod !== Math.floor(steps / zPeriod)) {
                // Not an exact multiple of the previous period - it could be a larger one
                zPeriod = steps;
            }
        }
    }

    // @ts-ignore: @types/mathjs doesn't realize the lcm function can take more than 2 arguments)
    const notExactlyLcm = lcm(xPeriod, yPeriod, zPeriod);

    // I have no idea why, but the LCM I'm getting is exactly half of what the challenge is expecting.
    // This is the case for both the test input and my actual challenge input. Doubling the return value,
    // because WEIRD MATH STUFF IS FUN!!!!!!!!!!!!!!
    //
    // EDIT: According to https://www.reddit.com/r/adventofcode/comments/e9o2sk/2019_day_12_part_2accidental_optimization_why_is/
    // and other threads, it's because the movement ends up being symmetrical; the velocities all start at zero, and calculating
    // the next point when they're all zero gives us a mirrored version of the initial layout. Running it again will mirror the
    // mirror, returning us to the next input.
    return notExactlyLcm * 2;
}

function splitInput(inputData: string) {
    return inputData.split('\n')
        .map(row => {
            const [x, y, z] = row.replace(/[<>xyz=\s]/g, '')
                .split(',')
                .map(n => Number(n)),
                point = new Point3D(x, y, z);
            return new BodyInSpace(point, new Vector3D(0, 0, 0));
        });
}

function adjustVelocity(moon: BodyInSpace, moonList: BodyInSpace[]) {
    let xDelta: number,
        yDelta: number,
        zDelta: number;
    xDelta = moonList.map(m => m.location.x)
        .reduce((acc, val) => acc + Math.sign(val - moon.location.x), 0);
    yDelta = moonList.map(m => m.location.y)
        .reduce((acc, val) => acc + Math.sign(val - moon.location.y), 0);
    zDelta = moonList.map(m => m.location.z)
        .reduce((acc, val) => acc + Math.sign(val - moon.location.z), 0);
    moon.velocity = new Vector3D(moon.velocity.xDelta + xDelta, moon.velocity.yDelta + yDelta, moon.velocity.zDelta + zDelta);
}
