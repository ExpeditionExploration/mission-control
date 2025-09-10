import { Module } from 'src/module';
import { ServerModuleDependencies } from 'src/server/server';
import { MotorState } from './class/MotorState';
import { Status } from './types';
import { OrangePi_5 } from 'opengpio';

const pwm1 = OrangePi_5.pwm(OrangePi_5.bcm.GPIO1_A3, 0.5, 1000);
const pwm2 = OrangePi_5.pwm(OrangePi_5.bcm.GPIO1_A2, 0.5, 1000);
const pwm3 = OrangePi_5.pwm(OrangePi_5.bcm.GPIO1_D1, 0.5, 1000);
const out1 = OrangePi_5.output(OrangePi_5.bcm.GPIO1_A4);


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
            pwm1.setDutyCycle(1-axis.y);
            pwm2.setDutyCycle(1-axis.x);
            out1.value = 1-axis.y == 0;
        });

        this.on('rightAxis', (axis) => {
            this.motors.roll.setPower(axis.x);
            this.motors.pitch.setPower(axis.y);
            pwm3.setDutyCycle(axis.x);
        });
    }
}
