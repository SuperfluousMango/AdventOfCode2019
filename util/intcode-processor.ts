export class IntcodeProcessor {
    private readonly origProgram: number[];

    inputVal: number | null = null;
    outputVal: number | null = null;

    constructor(private program: number[]) {
        this.program = [...program];
        this.origProgram = [...program];
    }

    resetProgram() {
        this.program = [...this.origProgram];
        this.inputVal = null;
        this.outputVal = null;
        return this;
    }

    setValue(pos: number, value: number) {
        this.program[pos] = value;
        return this;
    }

    runProgram() {
        let instructionPtr = 0;

        do {
            const baseOpCode = this.program[instructionPtr],
                op = this.buildOperation(baseOpCode, instructionPtr);
            let pos: number;

            switch (op.opCode) {
                case OpCode.ADD:
                    pos = op.params[2].value;
                    this.program[pos] = this.getParamValue(op.params[0]) + this.getParamValue(op.params[1]);
                    break;
                case OpCode.MUL:
                    pos = op.params[2].value;
                    this.program[pos] = this.getParamValue(op.params[0]) * this.getParamValue(op.params[1]);
                    break;
                case OpCode.PUT:
                    pos = op.params[0].value;
                    if (this.inputVal === null) {
                        throw new Error(`Attempt to write input when input not set at pos ${instructionPtr}`);
                    }
                    this.program[pos] = this.inputVal;
                    break;
                case OpCode.GET:
                    pos = op.params[0].value;
                    this.outputVal = this.program[pos];
                    break;
                case OpCode.END:
                    return this.program[0];
                default:
                    throw new Error(`Unexpected opcode ${op.opCode} encountered at pos ${instructionPtr}`);
            }

            instructionPtr += op.params.length + 1; // number of parameters, plus one for the opcode
        } while (instructionPtr <= this.program.length);

        throw new Error(`Unexpected EOF in program (instruction pointer ${instructionPtr}, program length ${this.program.length})`);
    }

    private buildOperation(opCodeInput: number, instructionPtr: number): Operation {
        const inputStr = opCodeInput.toString(),
            opCode = Number(inputStr.slice(-2)), // max 2-digit opcode
            paramSlice = this.getParamsForOpcode(opCode, instructionPtr),
            paddedStr = inputStr.padStart(paramSlice.length + 2), // Mode indicators for number of params (defaulting to zero), plus 2-digit opcode
            modeIndicators = paddedStr.substr(0, paramSlice.length)
                .split('')
                .reverse()
                .map(x => Number(x));

        return {
            opCode,
            params: paramSlice.map((val, idx) => ({
                mode: modeIndicators[idx],
                value: val
            }))
        };
    }

    private getParamsForOpcode(opCode: OpCode, instructionPtr: number): number[] {
        switch (opCode) {
            // 3 parameters
            case OpCode.ADD:
            case OpCode.MUL:
                return this.program.slice(instructionPtr + 1, instructionPtr + 4);
            // 1 parameter
            case OpCode.PUT:
            case OpCode.GET:
                return this.program.slice(instructionPtr + 1, instructionPtr + 2);
            // 0 parameters
            case OpCode.END:
                return [];
            default:
                throw new Error(`Unexpected opcode ${opCode} encountered at pos ${instructionPtr}`);
        }
    }

    private getParamValue(param: Parameter): number {
        return param.mode === ParameterMode.Position
            ? this.program[param.value]
            : this.inputVal;
    }
}

interface Operation {
    opCode: OpCode;
    params: Parameter[];
}

interface Parameter {
    mode: ParameterMode;
    value: number;
}

enum OpCode {
    ADD = 1,
    MUL = 2,
    PUT = 3,
    GET = 4,
    END = 99
}

enum ParameterMode {
    Position = 0,
    Immediate = 1
}
