export class Point {
    constructor(readonly x: number, readonly y: number) { }

    toString() {
        return `(${this.x},${this.y})`;
    }

    calcAngleToPoint(otherPoint: Point, useScreenStyleCoords = false) {
        // atan2 calculates angles as rotations from the X axis, but we want to calculate them
        // as standard compass angles (N = 0, E = 90, etc)
        let radiansConversionFactor = (180 / Math.PI),
            // Screen-style coords use the upper left corner as the origin (instead of the center)
            // and Y increases as we move down (instead of up)
            angle = useScreenStyleCoords
                ? radiansConversionFactor * Math.atan2(this.y - otherPoint.y, otherPoint.x - this.x)
                : radiansConversionFactor * Math.atan2(otherPoint.y - this.y, otherPoint.x - this.x);

        // Convert negative (below X axis) angles to 180-360 degrees
        if (angle < 0) {
            angle += 360;
        }

        // Rotate angles 90 degrees counterclockwise, so 0 is at top
        angle = (angle + 360 - 90) % 360;

        // Angles are still increasing as we go counterclockwise, so flip them
        return angle === 0 ? 0 : 360 - angle;
    }

    calcManhattanDistanceToPoint(otherPoint: Point) {
        return Math.abs(this.x - otherPoint.x) + Math.abs(this.y - otherPoint.y);
    }
}