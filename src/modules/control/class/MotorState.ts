import EventEmitter from 'events';
import { Logger } from 'src/logger';

export enum Direction {
    Forward,
    Backward,
}

const SPEED_MULTIPLIER = 0.5; // Default speed for the motor, can be adjusted as needed
export class MotorState extends EventEmitter {
    pin: number = 0;
    power: number = 0; // Power level for the motor, typically between 0 and 100
    logger: Logger;
    name: string;
    reverse: boolean = false;
    speed: number = 1; // Speed of the motor, used for smooth transitions
    private targetPower: number = 0; // Target power level for the motor, used for smooth transitions

    constructor({
        pin,
        logger,
        name,
        speed,
        reverse = false,
    }: {
        pin: number; // Pin number for the motor
        name: string;
        logger: Logger;
        speed?: number; // Speed of the motor, used for smooth transitions
        reverse?: boolean; // Reverse the direction of the stepper, useful if the stepper is mounted on the opposite side
    }) {
        super();
        this.logger = logger;
        this.name = name || '';
        this.speed = speed || 1; // Default speed is 1
        this.reverse = reverse;
        this.pin = pin;
    }

    async init() {
        this.logger.info(`Initializing motor ${this.name} on pin ${this.pin}`);
        setInterval(() => {
            if (this.targetPower !== this.power) {
                // Smoothly transition to the target power level
                const step = (this.targetPower - this.power) * SPEED_MULTIPLIER * this.speed; // Adjust the step size as needed
                this.power += step;
                if (Math.abs(this.targetPower - this.power) < 0.01) {
                    this.power = this.targetPower; // Snap to target if close enough
                }
                this.emit('setPower', this.power);
            }
        }, 100); // Update every 100 milliseconds
    }

    private powerTimeout?: NodeJS.Timeout;

    setPower(power: number) {
        this.targetPower = Math.max(-1, Math.min(1, power)); // Ensure power is between -1 and 1
        
        // Clear existing timeout
        if (this.powerTimeout) {
            clearTimeout(this.powerTimeout);
        }
        
        // Set timeout to reset power to 0 after 1 second only if target is not 0
        if (this.targetPower !== 0) {
            this.powerTimeout = setTimeout(() => {
            this.targetPower = 0;
            }, 1000);
        }
    }
}
