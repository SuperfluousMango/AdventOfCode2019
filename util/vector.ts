export class Vector {
    readonly direction: VectorDir;
    readonly magnitude: number;

    constructor(private readonly input: string) {
        this.direction = this.parseDirection(input[0]);
        this.magnitude = Number(input.substring(1, input.length));
    }

    private parseDirection(input: string) {
        switch (input.toLocaleUpperCase()) {
            case 'U':
                return VectorDir.Up;
            case 'R':
                return VectorDir.Right;
            case 'D':
                return VectorDir.Down;
            case 'L':
                return VectorDir.Left;
            default:
                throw new Error(`Unknown vector direction ${input}`);
        }
    }
}

export enum VectorDir {
    Up = 1,
    Right = 2,
    Down = 3,
    Left = 4
}
