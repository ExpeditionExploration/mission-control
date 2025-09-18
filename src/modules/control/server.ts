import { Module } from 'src/module';
import { ServerModuleDependencies } from 'src/server/server';
import { MotorState } from './class/MotorState';
import { Wrench } from './types';
import { OrangePi_5 } from 'opengpio';

const isProd = false; // process.env.NODE_ENV === 'production';
export class ControlModuleServer extends Module {
    motors: {
        heave: MotorState;
        sway: MotorState;
        surge: MotorState;
        yaw: MotorState;
        pitch: MotorState;
        roll: MotorState;
    } = {
        heave: new MotorState({
            logger: this.logger,
            name: 'Heave Motors',
        }),
        sway: new MotorState({
            logger: this.logger,
            name: 'Sway Motors',
        }),
        surge: new MotorState({
            name: 'Surge Motors', // large motor
            logger: this.logger,
            // gpioOutPWM: OrangePi_5.pwm(OrangePi_5.bcm.GPIO1_A3, 1, 500),
            // gpioOutStop: OrangePi_5.output(OrangePi_5.bcm.GPIO1_A4),
            invertPWM: true,
        }),
        yaw: new MotorState({
            name: 'Yaw Motors', // small motor
            logger: this.logger,
            // gpioOutPWM: OrangePi_5.pwm(OrangePi_5.bcm.GPIO1_A2, 0, 500),
            // gpioOutReverse: OrangePi_5.output(OrangePi_5.bcm.GPIO1_A6),
            invertRotationDirection: true,
        }),
        pitch: new MotorState({
            name: 'Pitch Motors', // medium motor
            logger: this.logger,
            // gpioOutPWM: OrangePi_5.pwm(OrangePi_5.bcm.GPIO1_D1, 1, 500),
            // gpioOutReverse: OrangePi_5.output(OrangePi_5.bcm.GPIO1_A7),
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
        this.emitWrenchContinuously();
    }

    emitWrenchContinuously() {
        setInterval(() => {
            const wrench: Wrench = {
                heave: this.motors.heave.power,
                sway: this.motors.sway.power,
                surge: this.motors.surge.power,
                yaw: this.motors.yaw.power,
                pitch: this.motors.pitch.power,
                roll: this.motors.roll.power,
            };
            this.emit('wrench', wrench);
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

        this.on('wrenchTarget', (wrench) => {
            this.motors.heave.setPower(wrench.heave);
            this.motors.sway.setPower(wrench.sway);
            this.motors.surge.setPower(wrench.surge);
            this.motors.yaw.setPower(wrench.yaw);
            this.motors.pitch.setPower(wrench.pitch);
            this.motors.roll.setPower(wrench.roll);
        });
    }
}
