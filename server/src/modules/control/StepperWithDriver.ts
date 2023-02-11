import { Gpio, waveAddGeneric, waveTxBusy, waveClear, waveTxStop, waveCreate, waveTxSend, WAVE_MODE_ONE_SHOT_SYNC, WAVE_MODE_ONE_SHOT } from 'pigpio';
import logger from 'debug';

const debug = logger('MissionControl:Classes:Stepper');

type Pins = {
    step: number;
    dir: number;
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
    pins!: { step: Gpio, dir: Gpio };
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
        this.degreesPerStep = 1;//options.degreesPerStep / options.gearRatio;

        this.pins = {
            step: new Gpio(pins.step, { mode: Gpio.OUTPUT }),
            dir: new Gpio(pins.dir, { mode: Gpio.OUTPUT }),
        }
        this.pins.step.digitalWrite(0);
        this.pins.dir.digitalWrite(0);
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

        const direction = steps > 0 ? Direction.Forward : Direction.Backward;
        if (direction === Direction.Forward) this.pins.dir.digitalWrite(1);
        else this.pins.dir.digitalWrite(0);
        // await this.wait(this.delay);

        this.pins.step.digitalWrite(0);

        steps = Math.abs(steps);
        debug(`Stepping ${steps} steps in direction ${direction}`);

        // let waveform: Step[] = [];
        for (let i = 0; i < steps; i++) {
            await this.wait(this.delay);
            this.pins.step.digitalWrite(1);
            await this.wait(this.delay);
            this.pins.step.digitalWrite(0);
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