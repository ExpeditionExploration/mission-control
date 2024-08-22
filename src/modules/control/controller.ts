import { Module } from 'src/module';
import { Axis } from './types';
import { NanoPi_NEO3, Pin } from 'opengpio';
import { StepperState } from './class/StepperState';

type Stepper = {
    state: StepperState;
    step: Pin;
    direction: Pin;
}

export class ControlModuleController extends Module {
    aileron!: {
        left: Stepper;
        right: Stepper;
    }

    async onModuleInit() {
        this.setupAileron();
    }

    setupAileron() {
        this.aileron = {
            left: {
                state: new StepperState(),
                step: NanoPi_NEO3.output(NanoPi_NEO3.bcm.GPIO2_B7),
                direction: NanoPi_NEO3.output(NanoPi_NEO3.bcm.GPIO2_A2),
            },
            right: {
                state: new StepperState(),
                step: NanoPi_NEO3.output(NanoPi_NEO3.bcm.GPIO2_C2),
                direction: NanoPi_NEO3.output(NanoPi_NEO3.bcm.GPIO2_C1),
            }
        }

        this.aileron.left.state.on('step', (step: number) => this.stepAileron(this.aileron.left, step));
        this.aileron.right.state.on('step', (step: number) => this.stepAileron(this.aileron.right, step));

        this.on<Axis>('aileron', (data) => {
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
     * Maps the axis to the aileron left and right rotation target
     */
    mapAxisToAileron({ x, y }: Axis): { left: number, right: number } {
        /**
         * { x: 0, y: 1 } -> { left: -90, right: -90 }
         * { x: 1, y: 1 } -> { left: -90, right: 0 }
         * { x: 1, y: 0 } -> { left: -90, right: 90 }
         * { x: 1, y: -1 } -> { left: 0, right: 90 }
         * { x: 0, y: -1 } -> { left: 90, right: 90 }
         * { x: -1, y: -1 } -> { left: 90, right: 0 }
         * { x: -1, y: 0 } -> { left: 90, right: -90 }
         * { x: -1, y: 1 } -> { left: 0, right: -90 }
         */

        x = this.clamp(x, -1, 1);
        y = this.clamp(y, -1, 1);

        // Map y to the range [-90, 90] for both left and right
        const left = y * 90;
        const right = y * 90;

        // Adjust left and right based on x
        if (x > 0) {
            // x is positive, reduce left and increase right
            return { left: left - x * 90, right: right + x * 90 };
        } else if (x < 0) {
            // x is negative, increase left and reduce right
            return { left: left - x * 90, right: right + x * 90 };
        } else {
            // x is zero, no adjustment needed
            return { left, right };
        }
    }

    clamp(value: number, min: number, max: number) {
        return Math.min(Math.max(value, min), max);
    }
    mapValue(value: number, inMin: number, inMax: number, outMin: number, outMax: number) {
        return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    }
}
