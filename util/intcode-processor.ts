export class IntcodeProcessor {
    private readonly origProgram: number[];
    private instructionPtr = 0;
    private relativeBase = 0;

    inputBuffer: number[] = [];
    outputVal: number | null = null;
    outputHandler: (output: number) => void;

    debugMode = false;

    constructor(private program: number[]) {
        this.program = [...program];
        this.origProgram = [...program];
    }

    resetProgram() {
        this.program = [...this.origProgram];
        this.instructionPtr = 0;
        this.inputBuffer = [];
        this.outputVal = null;
        return this;
    }

    setValue(pos: number, value: number) {
        this.program[pos] = value;
        return this;
    }

    runProgram() {
        if (this.debugMode) { console.log(this.program.join(',')); }
        if (this.debugMode) { console.log(`${this.instructionPtr === 0 ? 'Starting' : 'Resuming'} program at position ${this.instructionPtr}`); }

        do {
            const baseOpCode = this.program[this.instructionPtr],
                op = this.buildOperation(baseOpCode);
            let newVal: number;

            switch (op.opCode) {
                case OpCode.ADD:
                    if (this.debugMode) { console.log('ADD param vals', this.getParamValue(op.params[0]), this.getParamValue(op.params[1]), this.getParamValue(op.params[2], true)); }
                    newVal = this.getParamValue(op.params[0]) + this.getParamValue(op.params[1]);
                    this.writeValToPos(newVal, op.params[2]);
                    break;
                case OpCode.MUL:
                    if (this.debugMode) { console.log('MUL param vals', this.getParamValue(op.params[0]), this.getParamValue(op.params[1]), this.getParamValue(op.params[2], true)); }
                    newVal = this.getParamValue(op.params[0]) * this.getParamValue(op.params[1]);
                    this.writeValToPos(newVal, op.params[2]);
                    break;
                case OpCode.IN:
                    if (this.inputBuffer.length === 0) {
                        if (this.debugMode) { console.log(`WRI input is null at pos ${this.instructionPtr}, pausing`); }
                        // Input is not set, so stop the program here until they set an input and try again
                        return;
                    }
                    this.writeValToPos(this.inputBuffer.shift(), op.params[0]);
                    break;
                case OpCode.OUT:
                    if (this.debugMode) { console.log('OUT param val', this.getParamValue(op.params[0])); }
                    this.outputVal = this.getParamValue(op.params[0]);
                    if (this.outputHandler) {
                        this.outputHandler(this.outputVal);
                    }
                    break;
                case OpCode.JIT:
                    if (this.debugMode) { console.log('JIT param vals', this.getParamValue(op.params[0]), this.getParamValue(op.params[1])); }
                    if (this.getParamValue(op.params[0]) !== 0) {
                        this.moveInstructionPointer(this.getParamValue(op.params[1]), false);
                        continue; // don't do normal instruction pointer movement
                    }
                    break;
                case OpCode.JIF:
                    if (this.debugMode) { console.log('JIF param vals', this.getParamValue(op.params[0]), this.getParamValue(op.params[1])); }
                    if (this.getParamValue(op.params[0]) === 0) {
                        this.moveInstructionPointer(this.getParamValue(op.params[1]), false);
                        continue; // don't do normal instruction pointer movement
                    }
                    break;
                case OpCode.LT:
                    if (this.debugMode) { console.log('LT param vals', this.getParamValue(op.params[0]), this.getParamValue(op.params[1]), this.getParamValue(op.params[2], true)); }
                    newVal = this.getParamValue(op.params[0]) < this.getParamValue(op.params[1]) ? 1 : 0
                    this.writeValToPos(newVal, op.params[2]);
                    break;
                case OpCode.EQ:
                    if (this.debugMode) { console.log('EQ param vals', this.getParamValue(op.params[0]), this.getParamValue(op.params[1]), this.getParamValue(op.params[2], true)); }
                    newVal = this.getParamValue(op.params[0]) === this.getParamValue(op.params[1]) ? 1 : 0;
                    this.writeValToPos(newVal, op.params[2]);
                    break;
                case OpCode.REL:
                    if (this.debugMode) { console.log('REL param val', this.getParamValue(op.params[0])); }
                    this.relativeBase += this.getParamValue(op.params[0]);
                    if (this.debugMode) { console.log(`New relative base: ${this.relativeBase}`); }
                    break;
                case OpCode.END:
                    if (this.debugMode) { console.log('ENDing'); }
                    return this.program[0];
                default:
                    throw new Error(`Unexpected opcode ${op.opCode} encountered at instruction pointer ${this.instructionPtr}`);
            }

            this.moveInstructionPointer(op.params.length + 1, true); // number of parameters, plus one for the opcode
        } while (this.instructionPtr <= this.program.length);

        throw new Error(`Unexpected EOF in program (instruction pointer ${this.instructionPtr}, program length ${this.program.length})`);
    }

    private buildOperation(opCodeInput: number): Operation {
        const inputStr = opCodeInput.toString(),
            opCode = Number(inputStr.slice(-2)), // max 2-digit opcode
            paramSlice = this.getParamsForOpcode(opCode),
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

    private getParamsForOpcode(opCode: OpCode): number[] {
        let paramCount: number;

        switch (opCode) {
            // 3 parameters
            case OpCode.ADD:
            case OpCode.MUL:
            case OpCode.LT:
            case OpCode.EQ:
                paramCount = 3;
                break;
            // 2 paramters
            case OpCode.JIT:
            case OpCode.JIF:
                paramCount = 2;
                break;
            // 1 parameter
            case OpCode.IN:
            case OpCode.OUT:
            case OpCode.REL:
                paramCount = 1;
                break;
            // 0 parameters
            case OpCode.END:
                paramCount = 0;
                break;
            default:
                throw new Error(`Unexpected opcode ${opCode} encountered at pos ${this.instructionPtr}`);
        }

        return this.program.slice(this.instructionPtr + 1, this.instructionPtr + 1 + paramCount);
    }

    private getParamValue(param: Parameter, asWriteTarget = false): number {
        let pos;
        switch (param.mode) {
            case ParameterMode.Position:
            case ParameterMode.Immediate:
                pos = param.value;
                break;
            case ParameterMode.Relative:
                pos = param.value + this.relativeBase;
                break;
            default:
                throw new Error(`Unexpected parameter mode at instruction pointer ${this.instructionPtr}, param ${param.mode}/${param.value}`);
        }

        if (asWriteTarget || param.mode === ParameterMode.Immediate) {
            return pos;
        } else {
            if (pos < 0) {
                throw new Error(`Unexpected negative memory position at instruction pointer ${this.instructionPtr}, param ${param.mode}/${param.value}`);
            }
            return this.program[pos] || 0; // Uninitialized values default to zero
        }
    }

    private writeValToPos(val: number, posParam: Parameter) {
        const pos = this.getParamValue(posParam, true);
        if (this.debugMode) { console.log(`Writing ${val} to ${pos}`); }
        this.program[pos] = val;
    }

    private moveInstructionPointer(val: number, relative: boolean) {
        this.instructionPtr = relative ? this.instructionPtr + val : val;
        if (this.debugMode) { console.log(`${relative ? 'Incrementing' : 'Jumping'} instruction pointer to ${this.instructionPtr}`); }
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
    IN = 3,
    OUT = 4,
    JIT = 5,
    JIF = 6,
    LT = 7,
    EQ = 8,
    REL = 9,
    END = 99
}

enum ParameterMode {
    Position = 0,
    Immediate = 1,
    Relative = 2
}
