import { Pwm, Output } from 'opengpio';
import { MotorState } from './MotorState';
import { Logger } from 'src/logger';

export class ECMMotorState extends MotorState {
    gpioOutPWM: Pwm;// GPIO for the motor speed
    gpioOutReverse: Output; // GPIO for the motor reversing
    gpioOutStop: Output; // GPIO for the motor stopping (when 0% power duty cycle cannot stop it)
    invertPWM: boolean; // Invert the PWM signal, useful for certain motor drivers
    invertRotationDirection: boolean; // Invert the rotation direction of the motor
    
    constructor({
        name,
        logger,
        gpioOutPWM: gpioOutPWM,
        gpioOutReverse: gpioOutReverse,
        gpioOutStop: gpioOutStop,
        invertPWM: invertPWM,
        invertRotationDirection: invertRotationDirection,
        rampSpeed: rampSpeed,
    }: {
        name: string;
        logger: Logger;
        gpioOutPWM?: Pwm; 
        gpioOutReverse?: Output;
        gpioOutStop?: Output;
        invertPWM?: boolean;
        invertRotationDirection?: boolean;
        rampSpeed?: number;
    }) {
        super({name: name, logger: logger, rampSpeed: rampSpeed});
        this.gpioOutPWM = gpioOutPWM;
        this.gpioOutReverse = gpioOutReverse;
        this.gpioOutStop = gpioOutStop;
        this.invertPWM = invertPWM || false;
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
                if (this.gpioOutPWM) {
                    if (this.invertPWM) {
                        this.gpioOutPWM.setDutyCycle(1 - Math.abs(this.power));
                    } else {
                        this.gpioOutPWM.setDutyCycle(Math.abs(this.power));
                    }
                    if (this.gpioOutReverse) {
                        if (!this.invertRotationDirection) {
                            this.gpioOutReverse.value = this.power < 0;
                        }  else {
                            this.gpioOutReverse.value = this.power > 0;
                        }
                    }
                    if (this.gpioOutStop) {
                        this.gpioOutStop.value = this.power != 0;
                    }
                }
                this.emit('setPower', this.power);
            }
        }, 100);
    }
}
