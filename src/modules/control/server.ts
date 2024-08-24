import { Module } from 'src/module';
import { Axis } from './types';
import { NanoPi_NEO3, Pin } from 'opengpio';
import { StepperState } from './class/StepperState';
import { PCA9685, sleep } from 'openi2c';
import { ServerModuleDependencies } from 'src/server/server';

type Stepper = {
    state: StepperState;
    step: Pin;
    direction: Pin;
}

type Motor = {
    channel: number;
}

const isProd = process.env.NODE_ENV === 'production';

export class ControlModuleServer extends Module {
    DUTY_MIN = -1;
    DUTY_MAX = 1;
    ESC_DRIVER_FREQUENCY = 50;
    ESC_MIN = 0.05; // 1ms at 50Hz
    ESC_MAX = 0.1; // 2ms at 50Hz
    ESC_MID = (this.ESC_MIN + this.ESC_MAX) / 2;
    ESC_STOP_RANGE = 0.0001; // 0.2ms at 50Hz
    ESC_ARM = 0.1; // Any value over 2ms

    aileron!: {
        left: Stepper;
        right: Stepper;
    }
    thrusters!: {
        left: Motor;
        right: Motor;
    }
    pwmDriver!: PCA9685;

    constructor(deps: ServerModuleDependencies) {
        super(deps);
        this.pwmDriver = new PCA9685();
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

    async stepAileron(stepper: Stepper, step: number) {
        if (step > 0) {
            stepper.direction.value = true;
        } else {
            stepper.direction.value = false;
        }
        stepper.step.value = true;
        await sleep(1);
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
        this.thrusters = {
            left: {
                channel: 0,
            },
            right: {
                channel: 1,
            }
        }

        this.logger.debug('Setting up thrusters', this.pwmDriver);
        try {
            await this.pwmDriver.init();
        } catch (err) {
            this.logger.error('Error setting up PWM driver', err);
            this.pwmDriver = { setDutyCycle: async () => { } } as any;
        }

        this.armAllEsc();

        this.on<Axis>('thrusters', async (data) => {
            this.logger.debug('Thruster input', data);
            this.setEsc(this.thrusters.left.channel, data.y);
            this.setEsc(this.thrusters.right.channel, data.y);
        });
    }

    async setEsc(channel: number, value: number) {
        /**
         * TODO!
         * In one direction to zero, eg going from -1 to 0 duty cycle, 
         * the ESC will stop immediately vs the other direction where 
         * it will slowly decrease. I think because in one case the
         * ESC is receiving a signal that thinks it's changing direction
         * and in the other it on the same direction going to zero.
         * 
         * To address this I need to set find a range in which I classify 
         * the ESC as stopped and set the duty cycle to a stop number that 
         * the ESC will recognize as stopped, perhaps 0.
         */
        // value is between -1 and 1
        value = this.clamp(value, -1, 1);
        let mappedValue = this.mapValue(value, this.DUTY_MIN, this.DUTY_MAX, this.ESC_MIN, this.ESC_MAX);
        this.logger.debug(`Mapped value ${mappedValue}`, value, this.DUTY_MIN, this.DUTY_MAX, this.ESC_MIN, this.ESC_MAX);
        if ((mappedValue > (this.ESC_MID - this.ESC_STOP_RANGE)) && (mappedValue < (this.ESC_MID + this.ESC_STOP_RANGE))) {
            mappedValue = 1;
            // Setting this to 0 causes the ESC to rearm constantly.
            // Setting to 1 seemed to work as a stop value.
        }

        this.logger.debug(`Setting ESC ${channel} to ${mappedValue}`, this.ESC_MID, this.ESC_MID - this.ESC_STOP_RANGE, this.ESC_MID + this.ESC_STOP_RANGE);
        await this.pwmDriver.setDutyCycle(
            channel,
            mappedValue,
        );
    }

    async armAllEsc() {
        this.logger.debug('Arming ESCs');
        await this.setAllEsc(0);
        await sleep(1000);
        await this.setAllEsc(this.ESC_ARM);
        await sleep(5000);
        await this.setAllEsc(0);
        this.logger.debug('ESCs Armed');
    }

    async setAllEsc(dutyCycle: number) {
        this.logger.debug(`Setting all ESCs to ${dutyCycle}`);
        await Promise.all([
            this.setEsc(this.thrusters.left.channel, dutyCycle),
            this.setEsc(this.thrusters.right.channel, dutyCycle),
        ]);
    }
}
