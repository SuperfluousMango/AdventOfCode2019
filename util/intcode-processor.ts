export class IntcodeProcessor {
    private readonly OPCODE_ADD = 1;
    private readonly OPCODE_MUL = 2;
    private readonly OPCODE_END = 99;

    private readonly origProgram: number[];

    constructor(private program: number[]) {
        this.program = [...program];
        this.origProgram = [...program];
    }

    resetProgram() {
        this.program = [...this.origProgram];
        return this;
    }

    setValue(pos: number, value: number) {
        this.program[pos] = value;
        return this;
    }

    runProgram() {
        let instructionPtr = 0;

        do {
            const opCode = this.program[instructionPtr],
                params = this.getParamsForOpcode(opCode, instructionPtr);

            switch (opCode) {
                case this.OPCODE_ADD:
                    // Parameters:
                    // [0] - input pos 1
                    // [1] - input pos 2
                    // [2] - target pos
                    this.program[params[2]] = this.program[params[0]] + this.program[params[1]];
                    break;
                case this.OPCODE_MUL:
                    // Parameters:
                    // [0] - input pos 1
                    // [1] - input pos 2
                    // [2] - target pos
                    this.program[params[2]] = this.program[params[0]] * this.program[params[1]];
                    break;
                case this.OPCODE_END:
                    return this.program[0];
                default:
                    throw new Error(`Unexpected opcode ${opCode} encountered at pos ${instructionPtr}`);
            }

            instructionPtr += params.length + 1; // number of parameters, plus one for the opcode
        } while (instructionPtr <= this.program.length);

        throw new Error(`Unexpected EOF in program (instruction pointer ${instructionPtr}, program length ${this.program.length})`);
    }

    private getParamsForOpcode(opCode: number, instructionPtr: number): number[] {
        switch (opCode) {
            // 3 parameters
            case this.OPCODE_ADD:
            case this.OPCODE_MUL:
                return this.program.slice(instructionPtr + 1, instructionPtr + 4);
            // 0 parameters
            case this.OPCODE_END:
                return [];
            default:
                throw new Error(`Unexpected opcode ${opCode} encountered at pos ${instructionPtr}`);
        }
    }
}