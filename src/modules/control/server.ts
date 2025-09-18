import { Module } from 'src/module';
import { ServerModuleDependencies } from 'src/server/server';
import { MotorState } from './class/MotorState';
import { Status } from './types';
import { OrangePi_5 } from 'opengpio';

const isProd = false; // process.env.NODE_ENV === 'production';
export class ControlModuleServer extends Module {
    motors: {
        throttle: MotorState;
        yaw: MotorState;
        pitch: MotorState;
        roll: MotorState;
    } = {
        throttle: new MotorState({
            name: 'Throttle Motors', // large motor
            logger: this.logger,
            gpioOutPWM: OrangePi_5.pwm(OrangePi_5.bcm.GPIO1_A3, 1, 500),
            gpioOutStop: OrangePi_5.output(OrangePi_5.bcm.GPIO1_A4),
            invertPWM: true,
        }),
        yaw: new MotorState({
            name: 'Yaw Motors', // small motor
            logger: this.logger,
            gpioOutPWM: OrangePi_5.pwm(OrangePi_5.bcm.GPIO1_A2, 0, 500),
            gpioOutReverse: OrangePi_5.output(OrangePi_5.bcm.GPIO1_A6),
            invertRotationDirection: true,
        }),
        pitch: new MotorState({
            name: 'Pitch Motors', // medium motor
            logger: this.logger,
            gpioOutPWM: OrangePi_5.pwm(OrangePi_5.bcm.GPIO1_D1, 1, 500),
            gpioOutReverse: OrangePi_5.output(OrangePi_5.bcm.GPIO1_A7),
            invertPWM: true,
        }),
        roll: new MotorState({
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
