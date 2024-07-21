import EventEmitter from "events";

export enum Direction {
    Forward,
    Backward,
}

export class StepperState extends EventEmitter {
    current: number = 0;
    target: number = 0;

    timer: NodeJS.Timeout | null = null;
    constructor({
        delay = 1,
    } = {}) {
        super();

        this.timer = setInterval(() => {
            if (this.current < this.target) {
                this.step(Direction.Forward);
            } else if (this.current > this.target) {
                this.step(Direction.Backward);
            }
        }, delay);
    }

    moveTo(target: number) {
        // if (this.target === target) console.log('Move to', target);
        this.target = target;
    }

    step(direction: Direction) {
        const stepDirection = direction === Direction.Forward ? +1 : -1;
        this.current += stepDirection;
        if (this.current !== this.target) console.log('Current', this.current, 'Target', this.target);
        // console.log('Current', this.current, 'Target', this.target);
        // console.log('Step', direction);

        this.emit('step', stepDirection);
    }
}