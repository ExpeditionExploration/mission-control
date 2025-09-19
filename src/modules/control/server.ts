import { Module } from 'src/module';
import { ServerModuleDependencies } from 'src/server/server';
import { MotorState } from './class/MotorState';
import { ECMMotorState } from './class/ECMMotorState';
import { Wrench } from './types';
import { OrangePi_5 } from 'opengpio';

const isProd = false; // process.env.NODE_ENV === 'production';
export class ControlModuleServer extends Module {
    virtualMotors: { [key: string]: MotorState } = {
        heave: new MotorState({
            logger: this.logger,
            name: 'Heave Motors',
        }),
        sway: new MotorState({
            logger: this.logger,
            name: 'Sway Motors',
        }),
        surge: new MotorState({
            name: 'Surge Motors',
            logger: this.logger,
        }),
        yaw: new MotorState({
            name: 'Yaw Motors',
            logger: this.logger,
        }),
        pitch: new MotorState({
            name: 'Pitch Motors',
            logger: this.logger,
        }),
        roll: new MotorState({
            logger: this.logger,
            name: 'Roll Motors',
        }),
    };
    physicalMotors: { [key: string]: MotorState } = {
        rear: new ECMMotorState({
            name: 'Rear Motor',
            logger: this.logger,
            // gpioOutPWM: OrangePi_5.pwm(OrangePi_5.bcm.GPIO1_A3, 1, 500),
            // gpioOutStop: OrangePi_5.output(OrangePi_5.bcm.GPIO1_A4),
            invertPWM: true,
        }),
        rearTransverse: new ECMMotorState({
            name: 'Medium Motor',
            logger: this.logger,
            // gpioOutPWM: OrangePi_5.pwm(OrangePi_5.bcm.GPIO1_D1, 1, 500),
            // gpioOutReverse: OrangePi_5.output(OrangePi_5.bcm.GPIO1_A7),
            invertPWM: true,
        }),
        leftWing: new ECMMotorState({
            name: 'Small Motor Left',
            logger: this.logger,
            // gpioOutPWM: OrangePi_5.pwm(OrangePi_5.bcm.GPIO1_A2, 0, 500),
            // gpioOutReverse: OrangePi_5.output(OrangePi_5.bcm.GPIO1_A6),
            invertRotationDirection: true,
        }),
        rightWing: new ECMMotorState({
            name: 'Small Motor Right',
            logger: this.logger,
        }),
    };
    private virtualToPhysical: { [physicalKey: string]: { [virtualKey: string]: number } } = {};

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
                heave: this.virtualMotors.heave.power,
                sway: this.virtualMotors.sway.power,
                surge: this.virtualMotors.surge.power,
                yaw: this.virtualMotors.yaw.power,
                pitch: this.virtualMotors.pitch.power,
                roll: this.virtualMotors.roll.power,
            };
            this.emit('wrench', wrench);
        }, 250);
    }

    async setupMotors() {
        const virtual = Object.values(this.virtualMotors);
        const physical = Object.values(this.physicalMotors);
        const { heave, sway, surge, yaw, pitch, roll } = this.virtualMotors;

        // Initialize virtual and physical motors
        await Promise.all(virtual.map((m) => m.init()));
        await Promise.all(physical.map((m) => m.init()));

        // Define linear mapping from virtual motors to physical motors
        this.virtualToPhysical = {
            rear: { surge: 1 },
            rearTransverse: { yaw: 1 },
            leftWing: { roll: -1 },
            rightWing: { roll: 1 },
        };

        for (const motor of virtual) {
            motor.on('setPower', (power) => {
                this.logger.info(`${motor.name} power set to ${power}`);
            });
        }

        this.on('wrenchTarget', (wrench: Wrench) => {
            // Update virtual motors for telemetry/UX
            heave.setPower(wrench.heave);
            sway.setPower(wrench.sway);
            surge.setPower(wrench.surge);
            yaw.setPower(wrench.yaw);
            pitch.setPower(wrench.pitch);
            roll.setPower(wrench.roll);

            // Linearly combine each virtual motor power into each physical motor
            for (const [physicalKey, terms] of Object.entries(this.virtualToPhysical)) {
                let sum = 0;
                for (const [virtualKey, scale] of Object.entries(terms)) {
                    sum += (wrench[virtualKey] ?? 0) * scale;
                }
                this.physicalMotors[physicalKey].setPower(sum);
                this.logger.info(`${this.physicalMotors[physicalKey].name} power set to ${sum}`);
            }
        });
    }
}
