import { Gpio, waveAddGeneric, waveTxBusy, waveClear, waveTxStop, waveCreate, waveTxSend, WAVE_MODE_ONE_SHOT_SYNC, WAVE_MODE_ONE_SHOT } from 'pigpio';
import logger from 'debug';

const debug = logger('MissionControl:Classes:Stepper');

type Pins = {
    a1: number;
    a2: number;
    b1: number;
    b2: number;
}

type Options = {
    delay: number,
    degreesPerStep: number,
    gearRatio: number,
}

type Step = {
    gpioOn: number;
    gpioOff: number;
    usDelay: number;
}

enum Direction {
    Forward = 1,
    Backward = -1,
}

type StepperPhase = {
    a1: boolean;
    a2: boolean;
    b1: boolean;
    b2: boolean;
}

export default class Stepper {
    // pins!: { a1: Gpio, a2: Gpio, b1: Gpio, b2: Gpio };
    pins!: Pins;
    degreesPerStep!: number;
    delay!: number;
    queuedDegrees: number | null = null;
    lastStep: number = 0;
    degrees: number = 0;
    busy: boolean = false;

    constructor(pins: Pins, options: Options = {
        delay: 1000,
        degreesPerStep: 18,
        gearRatio: 21,
    }) {
        this.delay = options.delay;
        this.degreesPerStep = options.degreesPerStep / options.gearRatio;

        this.pins = pins;
        const a1 = new Gpio(pins.a1, { mode: Gpio.OUTPUT });
        const a2 = new Gpio(pins.a2, { mode: Gpio.OUTPUT });
        const b1 = new Gpio(pins.b1, { mode: Gpio.OUTPUT });
        const b2 = new Gpio(pins.b2, { mode: Gpio.OUTPUT });

        a1.digitalWrite(0);
        a2.digitalWrite(0);
        b1.digitalWrite(0);
        b2.digitalWrite(0);
        this.sendWaveform([this.stepperPhases[0]]);
    }

    // stepperPhases: { [pin: string]: StepperPhase } = {
    //     0: { a1: true, a2: false, b1: false, b2: false },
    //     1: { a1: false, a2: false, b1: true, b2: false },
    //     2: { a1: false, a2: true, b1: false, b2: false },
    //     3: { a1: false, a2: false, b1: false, b2: true }
    // }
    private get stepperPhases(): { [key: number]: Step } {
        return {
            0: { gpioOn: this.pins.a1, gpioOff: this.pins.b2, usDelay: this.delay },
            1: { gpioOn: this.pins.b1, gpioOff: this.pins.a1, usDelay: this.delay },
            2: { gpioOn: this.pins.a2, gpioOff: this.pins.b1, usDelay: this.delay },
            3: { gpioOn: this.pins.b2, gpioOff: this.pins.a2, usDelay: this.delay },
        }
        // return {
        //     0: [{ gpioOn: this.pins.b1, gpioOff: this.pins.b2, usDelay: this.delay }, { gpioOn: this.pins.a1, gpioOff: this.pins.a2, usDelay: this.delay }],
        //     1: [{ gpioOn: this.pins.b2, gpioOff: this.pins.b1, usDelay: this.delay }, { gpioOn: this.pins.a1, gpioOff: this.pins.a2, usDelay: this.delay }],
        //     2: [{ gpioOn: this.pins.b2, gpioOff: this.pins.b1, usDelay: this.delay }, { gpioOn: this.pins.a2, gpioOff: this.pins.a1, usDelay: this.delay }],
        //     3: [{ gpioOn: this.pins.b1, gpioOff: this.pins.b2, usDelay: this.delay }, { gpioOn: this.pins.a2, gpioOff: this.pins.a1, usDelay: this.delay }],
        // }
    }

    sendWaveform(waveform: Step[]) {
        waveClear();
        waveAddGeneric(waveform);

        let waveId = waveCreate();
        waveTxSend(waveId, WAVE_MODE_ONE_SHOT);
    }

    async wait(ms: number): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, ms);
        });
    }

    private async step(steps: number = 1): Promise<void> {
        if (steps === 0) return;
        if (this.busy) return;
        this.busy = true;

        const stepperPhases = this.stepperPhases;
        const direction = steps > 0 ? Direction.Forward : Direction.Backward;
        steps = Math.abs(steps);
        debug(`Stepping ${steps} steps in direction ${direction}`);

        let waveform: Step[] = [];
        for (let i = 0; i < steps; i++) {
            let nextStep = this.lastStep + direction;
            if (nextStep < 0) nextStep = 3;
            else if (nextStep > 3) nextStep = 0;

            waveform.push(stepperPhases[nextStep]);
            this.lastStep = nextStep;
            this.degrees += this.degreesPerStep * direction;
        }

        this.sendWaveform(waveform);

        return new Promise((resolve) => {
            const interval = setInterval(() => {
                if (!waveTxBusy()) {
                    clearInterval(interval);
                    this.busy = false;
                    resolve();

                    // if (this.queuedDegrees !== null) {
                    //     const queuedDegrees = this.queuedDegrees;
                    //     this.queuedDegrees = null;
                    //     this.goTo(queuedDegrees);
                    // }
                }
            }, 10);
        });
    }

    async goTo(degrees: number) {
        debug(`Going to ${degrees} degrees`);
        // If there is something queued, update the queued value
        // Wait for wave if initial setup wave is still going or if we are busy
        if (waveTxBusy() || this.busy) {
            debug(`Queued degrees: ${this.queuedDegrees}`);
            this.queuedDegrees = degrees;
        } else {
            // If there is nothing queued, calculate the difference and step
            const difference = degrees - this.degrees;
            const steps = Math.trunc(difference / this.degreesPerStep);
            debug(`Going to degrees: ${this.degrees}, difference: ${difference}, steps: ${steps}`);
            await this.step(steps);
        }
    }

    setZero() {

    }

    async findZero() {
        await this.goTo(90);
        await this.goTo(-90);
        await this.goTo(0);
    }
}