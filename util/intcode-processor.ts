export class IntcodeProcessor {
    private readonly origProgram: number[];
    private instructionPtr = 0;

    inputVal: number | null = null;
    outputVal: number | null = null;

    debugMode = false;

    constructor(private program: number[]) {
        this.program = [...program];
        this.origProgram = [...program];
    }

    resetProgram() {
        this.program = [...this.origProgram];
        this.instructionPtr = 0;
        this.inputVal = null;
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

            if (this.debugMode) { console.log(op); }
            let pos: number;

            switch (op.opCode) {
                case OpCode.ADD:
                    pos = op.params[2].value;
                    if (this.debugMode) { console.log('ADD param vals', this.getParamValue(op.params[0]), this.getParamValue(op.params[1])); }
                    this.program[pos] = this.getParamValue(op.params[0]) + this.getParamValue(op.params[1]);
                    break;
                case OpCode.MUL:
                    pos = op.params[2].value;
                    if (this.debugMode) { console.log('MUL param vals', this.getParamValue(op.params[0]), this.getParamValue(op.params[1])); }
                    this.program[pos] = this.getParamValue(op.params[0]) * this.getParamValue(op.params[1]);
                    break;
                case OpCode.WRI:
                    pos = op.params[0].value;
                    if (this.inputVal === null) {
                        if (this.debugMode) { console.log(`WRI input is null at pos ${this.instructionPtr}, pausing`); }
                        // Input is not set, so stop the program here until they set an input and try again
                        return;
                    }
                    if (this.debugMode) { console.log(`WRI input ${this.inputVal} to pos ${pos}`); }
                    this.program[pos] = this.inputVal;
                    this.inputVal = null;
                    break;
                case OpCode.OUT:
                    if (this.debugMode) { console.log('OUT param val', this.getParamValue(op.params[0])); }
                    this.outputVal = this.getParamValue(op.params[0]);
                    break;
                case OpCode.JIT:
                    pos = this.getParamValue(op.params[1]);
                    if (this.debugMode) { console.log('JIT param vals', this.getParamValue(op.params[0]), this.getParamValue(op.params[1])); }
                    if (this.getParamValue(op.params[0]) !== 0) {
                        if (this.debugMode) { console.log(`JITing to position ${pos}`); }
                        this.instructionPtr = pos;
                        continue; // don't do normal instruction pointer movement
                    }
                    break;
                case OpCode.JIF:
                    pos = this.getParamValue(op.params[1]);
                    if (this.debugMode) { console.log('JIF param vals', this.getParamValue(op.params[0]), this.getParamValue(op.params[1])); }
                    if (this.getParamValue(op.params[0]) === 0) {
                        if (this.debugMode) { console.log(`JIFing to position ${pos}`); }
                        this.instructionPtr = pos;
                        continue; // don't do normal instruction pointer movement;
                    }
                    break;
                case OpCode.LT:
                    pos = op.params[2].value;
                    if (this.debugMode) { console.log('LT param vals', this.getParamValue(op.params[0]), this.getParamValue(op.params[1])); }
                    this.program[pos] = this.getParamValue(op.params[0]) < this.getParamValue(op.params[1]) ? 1 : 0;
                    break;
                case OpCode.EQ:
                    pos = op.params[2].value;
                    if (this.debugMode) { console.log('EQ param vals', this.getParamValue(op.params[0]), this.getParamValue(op.params[1])); }
                    this.program[pos] = this.getParamValue(op.params[0]) == this.getParamValue(op.params[1]) ? 1 : 0;
                    break;
                case OpCode.END:
                    if (this.debugMode) { console.log('ENDing'); }
                    return this.program[0];
                default:
                    throw new Error(`Unexpected opcode ${op.opCode} encountered at pos ${this.instructionPtr}`);
            }

            this.instructionPtr += op.params.length + 1; // number of parameters, plus one for the opcode
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
            case OpCode.WRI:
            case OpCode.OUT:
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

    private getParamValue(param: Parameter): number {
        return param.mode === ParameterMode.Position
            ? this.program[param.value]
            : param.value;
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
    WRI = 3,
    OUT = 4,
    JIT = 5,
    JIF = 6,
    LT = 7,
    EQ = 8,
    END = 99
}

enum ParameterMode {
    Position = 0,
    Immediate = 1
}
