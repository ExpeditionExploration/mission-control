import { Module } from 'src/module';
import { ServerModuleDependencies } from 'src/server/server';
import { MotorState } from './class/MotorState';
import { Status } from './types';

const isProd = false; // process.env.NODE_ENV === 'production';
export class ControlModuleServer extends Module {
    motors: {
        throttle: MotorState;
        yaw: MotorState;
        pitch: MotorState;
        roll: MotorState;
    } = {
        throttle: new MotorState({
            pin: 2,
            logger: this.logger,
            name: 'Throttle Motors',
        }),
        yaw: new MotorState({
            pin: 3,
            logger: this.logger,
            name: 'Yaw Motors',
        }),
        pitch: new MotorState({
            pin: 4,
            logger: this.logger,
            name: 'Pitch Motors',
        }),
        roll: new MotorState({
            pin: 1,
            logger: this.logger,
            name: 'Roll Motors',
        }),
    };

    constructor(deps: ServerModuleDependencies) {
        super(deps);
    }

    async onModuleInit() {
        await this.setupMotors();
        this.emitStatusContinuously();
    }

    emitStatusContinuously() {
        setInterval(() => {
            const status: Status = {
                throttle: this.motors.throttle.power,
                yaw: this.motors.yaw.power,
                pitch: this.motors.pitch.power,
                roll: this.motors.roll.power,
            };
            this.emit('status', status);
        }, 250);
    }

    async setupMotors() {
        await Promise.all(
            Object.values(this.motors).map((motor) => {
                motor.init();
                motor.on('setPower', (power) => {
                    this.logger.info(
                        `${motor.name} power set to ${power}`,
                    );
                });
            }),
        );

        this.on('leftAxis', (axis) => {
            this.motors.yaw.setPower(axis.x);
            this.motors.throttle.setPower(axis.y);
        });

        this.on('rightAxis', (axis) => {
            this.motors.roll.setPower(axis.x);
            this.motors.pitch.setPower(axis.y);
        });
    }
}
