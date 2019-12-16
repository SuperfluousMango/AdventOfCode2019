import { Point3D } from "./point-3d";
import { Vector3D } from "./vector-3d";

export class BodyInSpace {
    constructor(public location: Point3D, public velocity: Vector3D) { }

    toString() {
        return `[${this.location.toString()} -> ${this.velocity.toString()}]`;
    }

    updateLocation(): void {
        this.location = new Point3D(this.location.x + this.velocity.xDelta,
            this.location.y + this.velocity.yDelta,
            this.location.z + this.velocity.zDelta);
    }

    calcPotentialEnergy() {
        return Math.abs(this.location.x) + Math.abs(this.location.y) + Math.abs(this.location.z);
    }

    calcKineticEnergy() {
        return Math.abs(this.velocity.xDelta) + Math.abs(this.velocity.yDelta) + Math.abs(this.velocity.zDelta);
    }
}
