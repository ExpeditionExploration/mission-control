import { Module } from 'src/module';
import { ServerModuleDependencies } from 'src/server/server';
import { MotorState } from './class/MotorState';
import { Status } from './types';

const isProd = false; // process.env.NODE_ENV === 'production';
export class ControlModuleServer extends Module {
    motors: {
        left: MotorState;
        right: MotorState;
        thrust: MotorState;
        pitch: MotorState;
        yaw: MotorState;
    } = {
        left: new MotorState({
            pin: 0,
            logger: this.logger,
            name: 'Left Motor',
        }),
        right: new MotorState({
            pin: 1,
            logger: this.logger,
            name: 'Right Motor',
        }),
        thrust: new MotorState({
            pin: 2,
            logger: this.logger,
            name: 'Thrust Motor',
        }),
        yaw: new MotorState({
            pin: 3,
            logger: this.logger,
            name: 'Yaw Motor',
        }),
        pitch: new MotorState({
            pin: 4,
            logger: this.logger,
            name: 'Pitch Motor',
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
                left: this.motors.left.power,
                right: this.motors.right.power,
                thrust: this.motors.thrust.power,
                yaw: this.motors.yaw.power,
                pitch: this.motors.pitch.power,
            };
            this.emit('status', status);
        }, 250); // Emit status every 500 milliseconds
    }

    async setupMotors() {
        await Promise.all(
            Object.values(this.motors).map((motor) => {
                motor.init();
                motor.on('setPower', (power) => {
                    this.logger.info(
                        `Motor ${motor.name} power set to ${power}`,
                    );
                });
            }),
        );

        this.on('leftJoystick', (axis) => {
            this.motors.yaw.setPower(axis.x);
            this.motors.thrust.setPower(axis.y);
        });

        this.on('rightJoystick', (axis) => {
            // TODO this needs to be mapped better to roll
            this.motors.left.setPower(-axis.x);
            this.motors.right.setPower(axis.x);
            this.motors.pitch.setPower(axis.y);
        });
    }
}
