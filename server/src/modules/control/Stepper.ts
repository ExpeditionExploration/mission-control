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
    pins!: { a1: Gpio, a2: Gpio, b1: Gpio, b2: Gpio };
    degreesPerStep!: number;
    delay!: number;
    queuedDegrees: number | null = null;
    lastStep: number = 0;
    degrees: number = 0;
    busy: boolean = false;

    constructor(pins: Pins, options: Options = {
        delay: 5,
        degreesPerStep: 18,
        gearRatio: 21,
    }) {
        this.delay = options.delay;
        this.degreesPerStep = options.degreesPerStep / options.gearRatio;

        this.pins = {
            a1: new Gpio(pins.a1, { mode: Gpio.OUTPUT }),
            a2: new Gpio(pins.a2, { mode: Gpio.OUTPUT }),
            b1: new Gpio(pins.b1, { mode: Gpio.OUTPUT }),
            b2: new Gpio(pins.b2, { mode: Gpio.OUTPUT })
        }
        this.setPhase(0);
        // this.sendWaveform(this.stepperPhases[0]);
    }

    stepperPhases: { [pin: string]: StepperPhase } = {
        0: { a1: true, a2: false, b1: false, b2: false },
        1: { a1: false, a2: false, b1: true, b2: false },
        2: { a1: false, a2: true, b1: false, b2: false },
        3: { a1: false, a2: false, b1: false, b2: true }
    }
    // stepperPhases: { [pin: string]: StepperPhase } = {
    //     0: { a1: true, a2: false, b1: true, b2: false },
    //     1: { a1: false, a2: true, b1: true, b2: false },
    //     2: { a1: false, a2: true, b1: false, b2: true },
    //     3: { a1: true, a2: false, b1: false, b2: true }
    // }

    // private get stepperPhases(): { [key: number]: { [pin: string]: number } } {
    //     // return {
    //     //     0: [{ gpioOn: this.pins.a1, gpioOff: this.pins.a2, usDelay: this.delay }, { gpioOn: this.pins.b1, gpioOff: this.pins.b2, usDelay: this.delay }],
    //     //     1: [{ gpioOn: this.pins.a1, gpioOff: this.pins.a2, usDelay: this.delay }, { gpioOn: this.pins.b2, gpioOff: this.pins.b1, usDelay: this.delay }],
    //     //     2: [{ gpioOn: this.pins.a2, gpioOff: this.pins.a1, usDelay: this.delay }, { gpioOn: this.pins.b2, gpioOff: this.pins.b1, usDelay: this.delay }],
    //     //     3: [{ gpioOn: this.pins.a2, gpioOff: this.pins.a1, usDelay: this.delay }, { gpioOn: this.pins.b1, gpioOff: this.pins.b2, usDelay: this.delay }],
    //     // }
    //     return {
    //         0: { a1: 1, a2: 0, b1: 1, b2: 0 },
    //         1: { a1: 1, a2: 0, b1: 0, b2: 1 },
    //         2: { a1: 0, a2: 1, b1: 0, b2: 1 },
    //         3: { a1: 0, a2: 1, b1: 1, b2: 0 }
    //     }
    //     // return {
    //     //     0: [{ gpioOn: this.pins.b1, gpioOff: this.pins.b2, usDelay: this.delay }, { gpioOn: this.pins.a1, gpioOff: this.pins.a2, usDelay: this.delay }],
    //     //     1: [{ gpioOn: this.pins.b2, gpioOff: this.pins.b1, usDelay: this.delay }, { gpioOn: this.pins.a1, gpioOff: this.pins.a2, usDelay: this.delay }],
    //     //     2: [{ gpioOn: this.pins.b2, gpioOff: this.pins.b1, usDelay: this.delay }, { gpioOn: this.pins.a2, gpioOff: this.pins.a1, usDelay: this.delay }],
    //     //     3: [{ gpioOn: this.pins.b1, gpioOff: this.pins.b2, usDelay: this.delay }, { gpioOn: this.pins.a2, gpioOff: this.pins.a1, usDelay: this.delay }],
    //     // }
    // }

    async setPhase(phase: number) {
        // Turn off all pins if null
        const stepperPhase: StepperPhase = this.stepperPhases[phase];

        // debug('setPhase', phase, stepperPhase)
        this.pins.a1.digitalWrite(+stepperPhase.a1);
        this.pins.a2.digitalWrite(+stepperPhase.a2);
        this.pins.b1.digitalWrite(+stepperPhase.b1);
        this.pins.b2.digitalWrite(+stepperPhase.b2);
        await this.wait(this.delay);
    }

    // sendWaveform(waveform: Step[]) {
    //     waveClear();
    //     waveAddGeneric(waveform);

    //     let waveId = waveCreate();
    //     waveTxSend(waveId, WAVE_MODE_ONE_SHOT);
    // }

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

        const direction = steps > 0 ? Direction.Forward : Direction.Backward;
        steps = Math.abs(steps);
        debug(`Stepping ${steps} steps in direction ${direction}`);

        // let waveform: Step[] = [];
        for (let i = 0; i < steps; i++) {
            let nextStep = this.lastStep + direction;
            if (nextStep < 0) nextStep = 3;
            else if (nextStep > 3) nextStep = 0;

            // waveform.push(...stepperPhases[nextStep]);
            await this.setPhase(nextStep);
            this.lastStep = nextStep;
            this.degrees += this.degreesPerStep * direction;
        }

        // this.sendWaveform(waveform);
        this.busy = false;

        if (this.queuedDegrees !== null) {
            const queuedDegrees = this.queuedDegrees;
            this.queuedDegrees = null;
            this.goTo(queuedDegrees);
        }
        // return new Promise((resolve) => {
        //     const interval = setInterval(() => {
        //         if (!waveTxBusy()) {
        //             clearInterval(interval);
        //             this.busy = false;
        //             resolve();

        //             if (this.queuedDegrees !== null) {
        //                 const queuedDegrees = this.queuedDegrees;
        //                 this.queuedDegrees = null;
        //                 this.goTo(queuedDegrees);
        //             }
        //         }
        //     }, 10);
        // });
    }

    async goTo(degrees: number) {
        debug(`Going to ${degrees} degrees`);
        // If there is something queued, update the queued value
        // Wait for wave if initial setup wave is still going or if we are busy
        if (this.busy) {
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

    findZero() {

    }
}