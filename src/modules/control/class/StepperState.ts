import EventEmitter from "events";
import { Logger } from "src/logger";

export enum Direction {
    Forward,
    Backward,
}

export class StepperState extends EventEmitter {
    current: number = 0;
    target: number = 0;
    logger: Logger;
    name: string;
    timer: NodeJS.Timeout | null = null;
    reverse: boolean = false;

    constructor({
        logger,
        delay = 5, // Delay in ms between each step
        name,
        reverse = false,
    }: {
        name?: string,
        logger: Logger,
        delay?: number,
        reverse?: boolean, // Reverse the direction of the stepper, useful if the stepper is mounted on the opposite side
    }) {
        super();
        this.logger = logger;
        this.name = name || '';
        this.reverse = reverse;

        this.timer = setInterval(() => {
            if (this.current < this.target) {
                this.step(Direction.Forward);
            } else if (this.current > this.target) {
                this.step(Direction.Backward);
            }
        }, delay);
    }

    moveTo(target: number) {
        this.target = Math.round(target); // Round to nearest whole number
    }

    step(direction: Direction) {
        const stepDirection = direction === Direction.Forward ? +1 : -1;
        this.current += stepDirection;

        this.emit('step', stepDirection);
    }
}