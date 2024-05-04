import EventEmitter from "events";
import { debug } from "debug";

const log = debug('MissionControl:Utils:SmoothValue');
export class SmoothValue extends EventEmitter {
    private _value: number;
    private _speed!: number;
    private target: number;
    private timer: NodeJS.Timer;
    private readonly delta: number;

    constructor({ value = 0, speed = 1 } = {}) {
        super();
        this._value = value;
        this.target = value;
        this.speed = speed;

        const interval = 1000 / 30;
        this.delta = interval / 1000;
        this.timer = setInterval(() => this.update(), interval);
    }

    destroy() {
        clearInterval(this.timer);
    }

    get value() {
        return this._value;
    }

    private increment = 0;
    set value(value: number) {
        log('Set value', value);
        this.target = value;
        log('New target', this.target);
        this.increment = (value - this._value) * (this._speed * this.delta);
        log('New increment', this.increment, value, this._value, this._speed, this.delta);
    }

    set speed(value: number) {
        this._speed = Math.max(0, value); // Speed must be positive
    }

    update() {
        let newValue = this._value + this.increment;
        log('Update value', newValue, this._value, this.increment);
        if (this.increment > 0 && newValue > this.target) {
            newValue = this.target;
        } else if (this.increment < 0 && newValue < this.target) {
            newValue = this.target;
        }

        this._value = newValue;
        log('Updated value', this._value);
        this.emit('update', this._value);
    }
}