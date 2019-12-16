export class Vector3D {
    constructor(readonly xDelta: number, readonly yDelta: number, readonly zDelta: number) { }

    toString() {
        return `(${this.xDelta},${this.yDelta},${this.zDelta})`;
    }
}
