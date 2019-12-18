import { inputData } from "./data";
import { IntcodeProcessor } from "../util/intcode-processor";
import { Point } from "../util/point";
import { TileId } from "./tile-id";
import { Direction } from "./direction";

console.log(`Puzzle A solution: ${puzzleA()}`);
console.log(`Puzzle B solution: ${puzzleB()}`);

function puzzleA() {
    const program = splitInput(inputData),
        processor = new IntcodeProcessor(program),
        tileMap = buildMap(processor),
        oxygenSystemEntry = [...tileMap.entries()].find(([_, tileId]) => tileId === TileId.OxygenSystem),
        [oxygenSystemCoords, _dummy] = oxygenSystemEntry,
        coordsToMap: Point[] = [],
        distMap = new Map<string, number>();

    let initialPos = new Point(0, 0);
    coordsToMap.push(initialPos);

    // Find shortest distance from start to oxygen system
    while (coordsToMap.length) {
        const curPos = coordsToMap.pop(),
            neighbors = curPos.getNeighborCoords(),
            oldNeighbors = neighbors.filter(point => distMap.has(point.toString())),
            newNeighbors = neighbors.filter(point => !oldNeighbors.includes(point)),
            dist = oldNeighbors.length > 0
                ? Math.min(...oldNeighbors.map(point => distMap.get(point.toString()))) + 1
                : 0;

        distMap.set(curPos.toString(), dist);

        const newNeighborsWithoutWalls = newNeighbors.filter(point => tileMap.get(point.toString()) !== TileId.Wall),
            oldNeighborsNowCloser = oldNeighbors.filter(point => distMap.get(point.toString()) > dist + 1);
        coordsToMap.push(...newNeighborsWithoutWalls, ...oldNeighborsNowCloser);
    }

    return distMap.get(oxygenSystemCoords);
}

function puzzleB() {
    const program = splitInput(inputData),
        processor = new IntcodeProcessor(program),
        tileMap = buildMap(processor),
        oxygenSystemEntry = [...tileMap.entries()].find(([_, tileId]) => tileId === TileId.OxygenSystem),
        [oxygenSystemCoords, _dummy] = oxygenSystemEntry,
        coordsToMap: Point[] = [],
        distMap = new Map<string, number>();

    let initialPos = Point.fromPointString(oxygenSystemCoords);
    coordsToMap.push(initialPos);

    // Find greatest distance from oxygen system to anywhere
    while (coordsToMap.length) {
        const curPos = coordsToMap.pop(),
            neighbors = curPos.getNeighborCoords(),
            oldNeighbors = neighbors.filter(point => distMap.has(point.toString())),
            newNeighbors = neighbors.filter(point => !oldNeighbors.includes(point)),
            dist = oldNeighbors.length > 0
                ? Math.min(...oldNeighbors.map(point => distMap.get(point.toString()))) + 1
                : 0;

        distMap.set(curPos.toString(), dist);

        const newNeighborsWithoutWalls = newNeighbors.filter(point => tileMap.get(point.toString()) !== TileId.Wall),
            oldNeighborsNowCloser = oldNeighbors.filter(point => distMap.get(point.toString()) > dist + 1);
        coordsToMap.push(...newNeighborsWithoutWalls, ...oldNeighborsNowCloser);
    }

    return Math.max(...[...distMap.values()]);
}

function splitInput(inputData: string) {
    return inputData.split(',')
        .map(x => Number(x));
}

function buildMap(processor: IntcodeProcessor) {
    const map = new Map<string, TileId>(),
        tilesToExplore = new Set<string>(),
        initialPos = new Point(0, 0);

    // Initial coords
    let x = initialPos.x,
        y = initialPos.y;
    map.set(initialPos.toString(), TileId.Empty);

    let exploring = true,
        path = [new Point(x, y)];
    do {
        const curTile = new Point(x, y);
        if (exploring) {
            let newTile: Point;
            curTile.getNeighborCoords()
                .forEach(point => {
                    const pointStr = point.toString();
                    if (!map.has(pointStr)) {
                        if (!tilesToExplore.has(pointStr)) {
                            tilesToExplore.add(pointStr);
                        }
                        if (!newTile) {
                            newTile = point;
                        }
                    }
                });

            if (newTile) {
                processor.inputBuffer.push(getDirection(curTile, newTile));
                processor.runProgram();
                map.set(newTile.toString(), processor.outputVal);
                tilesToExplore.delete(newTile.toString());
                if (processor.outputVal !== TileId.Wall) {
                    // We actually moved - update coords and add tile to path
                    x = newTile.x;
                    y = newTile.y;
                    path.push(newTile);
                }
            } else {
                // We have nowhere new to go in this chain - set flag and remove tile from path
                exploring = false;
                path.pop();
            }
        } else {
            const newTile = path.pop();
            processor.inputBuffer = getDirection(curTile, newTile);
            processor.runProgram();
            // Ignore output because we're backtracking, so we already know what's there.
            x = newTile.x;
            y = newTile.y;

            // If one of our new tile's neighbors hasn't been explored yet, switch back to exploration mode
            exploring = newTile.getNeighborCoords()
                .map(point => point.toString())
                .some(pointStr => tilesToExplore.has(pointStr));
            if (exploring) {
                // Restore the new tile to the path, so we can backtrack to it later
                path.push(newTile);
            }
        }
    } while (tilesToExplore.size > 0 || path.length > 0);

    return map;
}

function getDirection(curPos: Point, nextPos: Point) {
    if (curPos.x === nextPos.x) {
        return curPos.y > nextPos.y ? Direction.North : Direction.South;
    } else {
        return curPos.x > nextPos.x ? Direction.West : Direction.East;
    }
}