export class Point3D {
    constructor(readonly x: number, readonly y: number, readonly z: number) { }

    toString() {
        return `(${this.x},${this.y},${this.z})`;
    }
}
