import { Pwm, Output } from 'opengpio';
import { MotorState } from './MotorState';
import { Logger } from 'src/logger';

export class ECMMotorState extends MotorState {
    gpioOutPWM: Pwm | number;
    gpioOutReverse: Output | number;
    gpioOutStop: Output | number;
    invertPWM: boolean; // Invert the PWM signal, useful for certain motor drivers
    invertPWMWithDirection: boolean; // Invert PWM when direction is reversed
    invertRotationDirection: boolean; // Invert the rotation direction of the motor
    
    constructor({
        name,
        logger,
        gpioOutPWM: gpioOutPWM,
        gpioOutReverse: gpioOutReverse,
        gpioOutStop: gpioOutStop,
        invertPWM: invertPWM,
        invertPWMWithDirection: invertPWMWithDirection,
        invertRotationDirection: invertRotationDirection,
        rampSpeed: rampSpeed,
        position: position,
        orientation: orientation,
        scale: scale,
    }: {
        name: string;
        logger: Logger;
        gpioOutPWM?: Pwm | number;
        gpioOutReverse?: Output | number;
        gpioOutStop?: Output | number;
        invertPWM?: boolean;
        invertPWMWithDirection?: boolean;
        invertRotationDirection?: boolean;
        rampSpeed?: number;
        position?: number[];
        orientation?: number[];
        scale?: number;
    }) {
        super({name: name, logger: logger, rampSpeed: rampSpeed, position: position, orientation: orientation, scale: scale});
        this.gpioOutPWM = gpioOutPWM;
        this.gpioOutReverse = gpioOutReverse;
        this.gpioOutStop = gpioOutStop;
        this.invertPWM = invertPWM || false;
        this.invertPWMWithDirection = invertPWMWithDirection || false;
        this.invertRotationDirection = invertRotationDirection || false;
    }

    async init() {
        this.logger.info(`Initializing ${this.name}`);
        setInterval(() => {
            if (this.targetPower !== this.power) {
                // Smoothly transition to the target power level
                const step = (this.targetPower - this.power) * this.rampSpeed;
                this.power += step;
                if (Math.abs(this.targetPower - this.power) < 0.01) {
                    this.power = this.targetPower; // Snap to target if close enough
                }
                if (typeof this.gpioOutPWM !== 'undefined') {
                    let dutyCycle = Math.abs(this.power);
                    if (this.invertPWM) {
                        dutyCycle = 1 - dutyCycle;
                    }
                    if (this.invertPWMWithDirection && this.power < 0) {
                        dutyCycle = 1 - dutyCycle;
                    }
                    if (this.gpioOutPWM instanceof Pwm) {
                        this.gpioOutPWM.setDutyCycle(dutyCycle);
                    }
                    else if (MotorState.pwmModule) {
                        MotorState.pwmModule.setDutyCycle(this.gpioOutPWM, dutyCycle);
                    }
                    if (typeof this.gpioOutReverse !== 'undefined') {
                        let reverse = this.power < 0;
                        if (this.invertRotationDirection) {
                            reverse = this.power > 0;
                        }
                        if (this.gpioOutReverse instanceof Output) {
                            this.gpioOutReverse.value = reverse;
                        }
                        else if (MotorState.pwmModule) {
                            MotorState.pwmModule.setDutyCycle(this.gpioOutReverse, reverse ? 1 : 0);
                        }
                    }
                    if (typeof this.gpioOutStop !== 'undefined') {
                        if (this.gpioOutStop instanceof Output) {
                            this.gpioOutStop.value = this.power != 0;
                        }
                        else if (MotorState.pwmModule) {
                            MotorState.pwmModule.setDutyCycle(this.gpioOutStop, this.power != 0 ? 1 : 0);
                        }
                    }
                }
                this.emit('setPower', this.power);
            }
        }, 100);
    }
}
