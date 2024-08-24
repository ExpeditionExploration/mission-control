import { Module } from 'src/module';
import { Axis } from './types';
import { NanoPi_NEO3, Pin } from 'opengpio';
import { StepperState } from './class/StepperState';
import { PCA9685 } from 'openi2c';

type Stepper = {
    state: StepperState;
    step: Pin;
    direction: Pin;
}

const isProd = process.env.NODE_ENV === 'production';

export class ControlModuleServer extends Module {
    aileron!: {
        left: Stepper;
        right: Stepper;
    }

    async onModuleInit() {
        await this.setupAileron();
        await this.setupThrusters();
    }

    async setupAileron() {
        this.aileron = {
            left: {
                state: new StepperState({ logger: this.logger, name: 'Aileron Left' }),
                step: isProd ? NanoPi_NEO3.output(NanoPi_NEO3.bcm.GPIO3_B0) : { value: true } as any,
                direction: isProd ? NanoPi_NEO3.output(NanoPi_NEO3.bcm.GPIO0_D3) : { value: true } as any,
            },
            right: {
                state: new StepperState({ logger: this.logger, name: 'Aileron Right' }),
                step: isProd ? NanoPi_NEO3.output(NanoPi_NEO3.bcm.GPIO3_A7) : { value: true } as any,
                direction: isProd ? NanoPi_NEO3.output(NanoPi_NEO3.bcm.GPIO2_C7) : { value: true } as any,
            }
        }

        this.aileron.left.state.on('step', (step: number) => this.stepAileron(this.aileron.left, step));
        this.aileron.right.state.on('step', (step: number) => this.stepAileron(this.aileron.right, step * -1)); // Reverse the step direction of the right aileron because it's mounted on the opposite side

        this.on<Axis>('ailerons', (data) => {
            this.logger.debug('Aileron input', data);
            const aileronTargets = this.mapAxisToAileron(data);
            this.aileron.left.state.moveTo(aileronTargets.left);
            this.aileron.right.state.moveTo(aileronTargets.right);
        });
    }

    stepAileron(stepper: Stepper, step: number) {
        if (step > 0) {
            stepper.direction.value = true;
        } else {
            stepper.direction.value = false;
        }
        stepper.step.value = true;
        stepper.step.value = false;
    }

    /**
     * Maps the axis to the aileron left and right rotation target.
     * Allows for reverse mapping of y axis.
     */
    mapAxisToAileron({ x, y }: Axis, invertY = true): { left: number, right: number } {
        x = this.clamp(x, -1, 1);
        y = this.clamp(y, -1, 1);

        let degrees = Math.atan2(x, y) * (180 / Math.PI); // We purpose swap x and y so the rotation starts at 0 degrees and moves clockwise like on the joystick
        if (degrees < 0) degrees += 360; // Convert negative degrees to positive to fit the 0-360 degree range

        let left = 0;
        let right = 0;
        let isCentered = x === 0 && y === 0;

        if (!isCentered) {
            // If the joystick is not in the center
            if (invertY) {
                /**
                * Invert Y
                * { x: 0, y: 1 } -> { left: -90, right: -90 } = 0 degrees
                *      { x: 1, y: 1 } -> { left: -90, right: 0 } = 45 degrees
                * { x: 1, y: 0 } -> { left: -90, right: 90 } = 90 degrees
                *      { x: 1, y: -1 } -> { left: 0, right: 90 } = 135 degrees
                * { x: 0, y: -1 } -> { left: 90, right: 90 } = 180 degrees
                *      { x: -1, y: -1 } -> { left: 90, right: 0 } = 225 degrees
                * { x: -1, y: 0 } -> { left: 90, right: -90 } = 270 degrees 
                *      { x: -1, y: 1 } -> { left: 0, right: -90 } = 315 degrees
                */
                if (degrees < 90) {
                    left = this.mapValue(degrees, 0, 90, -90, -90); // Left aileron is always -90 degrees in this range
                    right = this.mapValue(degrees, 0, 90, -90, 90);
                } else if (degrees < 180) {
                    left = this.mapValue(degrees, 90, 180, -90, 90);
                    right = this.mapValue(degrees, 90, 180, 90, 90); // Right aileron is always 90 degrees in this range
                } else if (degrees < 270) {
                    left = this.mapValue(degrees, 180, 270, 90, 90); // Left aileron is always 90 degrees in this range
                    right = this.mapValue(degrees, 180, 270, 90, -90);
                } else { // degrees < 360
                    left = this.mapValue(degrees, 270, 360, 90, -90);
                    right = this.mapValue(degrees, 270, 360, -90, -90); // Right aileron is always -90 degrees in this range
                }
            } else {
                /**
                 * Non-Inverted Y
                 * { x: 0, y: 1 } -> { left: 90, right: 90 } = 0 degrees
                 *      { x: 1, y: 1 } -> { left: 0, right: 90 } = 45 degrees
                 * { x: 1, y: 0 } -> { left: -90, right: 90 } = 90 degrees
                 *      { x: 1, y: -1 } -> { left: -90, right: 0 } = 135 degrees
                 * { x: 0, y: -1 } -> { left: -90, right: -90 } = 180 degrees
                 *      { x: -1, y: -1 } -> { left: 0, right: -90 } = 225 degrees
                 * { x: -1, y: 0 } -> { left: 90, right: -90 } = 270 degrees 
                 *      { x: -1, y: 1 } -> { left: 90, right: 0 } = 315 degrees
                 */
                if (degrees < 90) {
                    left = this.mapValue(degrees, 0, 90, 90, -90);
                    right = this.mapValue(degrees, 0, 90, 90, 90); // Right aileron is always 90 degrees in this range
                } else if (degrees < 180) {
                    left = this.mapValue(degrees, 90, 180, -90, -90); // Left aileron is always -90 degrees in this range
                    right = this.mapValue(degrees, 90, 180, 90, -90);
                } else if (degrees < 270) {
                    left = this.mapValue(degrees, 180, 270, -90, 90);
                    right = this.mapValue(degrees, 180, 270, -90, -90); // Right aileron is always -90 degrees in this range
                } else { // degrees < 360
                    left = this.mapValue(degrees, 270, 360, 90, 90); // Left aileron is always 90 degrees in this range
                    right = this.mapValue(degrees, 270, 360, -90, 90);
                }
            }
        }

        return {
            left: left,
            right: right
        };
    }

    clamp(value: number, min: number, max: number) {
        return Math.min(Math.max(value, min), max);
    }
    mapValue(value: number, inMin: number, inMax: number, outMin: number, outMax: number) {
        return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    }

    async setupThrusters() {
        let pwmDriver: PCA9685;
        try {
            pwmDriver = new PCA9685();
            await pwmDriver.setFrequency(50);
        } catch (err) {
            this.logger.error('Error setting up PWM driver', err);
            pwmDriver = { setDutyCycle: async () => { } } as any;
        }

        this.on<Axis>('thrusters', async (data) => {
            this.logger.debug('Thruster input', data);
            const { left, right } = this.mapAxisToThrusters(data);

            await pwmDriver.setDutyCycle(0, left);
            await pwmDriver.setDutyCycle(1, right);
        });
    }
    mapAxisToThrusters({ x, y }: Axis): { left: number, right: number } {
        x = this.clamp(x, -1, 1);
        y = this.clamp(y, -1, 1);

        let left = this.mapValue(y, -1, 1, 0.05, 0.95);
        let right = this.mapValue(y, -1, 1, 0.05, 0.95);

        return {
            left,
            right
        }
    }
}
