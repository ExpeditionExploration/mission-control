import EventEmitter from 'events';
import { Pwm, Output } from 'opengpio';
import { Logger } from 'src/logger';

export enum Direction {
    Forward,
    Backward,
}

const SPEED_MULTIPLIER = 0.5; // Default speed for the motor, can be adjusted as needed
export class MotorState extends EventEmitter {
    logger: Logger;
    name: string;
    gpioOutPWM: Pwm;// GPIO for the motor speed
    gpioOutReverse: Output; // GPIO for the motor reversing
    gpioOutStop: Output; // GPIO for the motor stopping (when 0% power duty cycle cannot stop it)
    invertPWM: boolean; // Invert the PWM signal, useful for certain motor drivers
    invertRotationDirection: boolean; // Invert the rotation direction of the motor
    rampSpeed: number; // Ramp speed of the motor, used for smooth transitions
    power: number = 0; // Power level for the motor, typically between -100 and 100
    private targetPower: number = 0; // Target power level for the motor, used for smooth transitions

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
        super();
        this.name = name;
        this.logger = logger;
        this.gpioOutPWM = gpioOutPWM;
        this.gpioOutReverse = gpioOutReverse;
        this.gpioOutStop = gpioOutStop;
        this.invertPWM = invertPWM || false;
        this.invertRotationDirection = invertRotationDirection || false;
        this.rampSpeed = rampSpeed || 1;
    }

    async init() {
        this.logger.info(`Initializing ${this.name}`);
        setInterval(() => {
            if (this.targetPower !== this.power) {
                // Smoothly transition to the target power level
                const step = (this.targetPower - this.power) * SPEED_MULTIPLIER * this.rampSpeed; // Adjust the step size as needed
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

    private powerTimeout?: NodeJS.Timeout;

    setPower(power: number) {
        this.targetPower = Math.max(-1, Math.min(1, power)); // Ensure power is between -1 and 1
        
        // Clear existing timeout
        if (this.powerTimeout) {
            clearTimeout(this.powerTimeout);
        }
        
        // Set timeout to reset power to 0 only if target is not 0
        if (this.targetPower !== 0) {
            this.powerTimeout = setTimeout(() => {
            this.targetPower = 0;
            }, 60000);
        }
    }
}
