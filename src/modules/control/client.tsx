import { Module } from 'src/module';
import { UserInterface } from 'src/client/user-interface';
import { ClientModuleDependencies } from 'src/client/client';
import { Axis } from './types';

export class ControlModuleClient extends Module {
    userInterface: UserInterface;
    constructor(deps: ClientModuleDependencies) {
        super(deps);
        this.userInterface = deps.userInterface;
    }

    onModuleInit(): void | Promise<void> {
        setInterval(() => {
            const [gamepad] = navigator.getGamepads();

            if (gamepad) {
                this.processLeftJoystickInput([
                    gamepad.axes[0],
                    gamepad.axes[1],
                ]);
                this.processRightJoystickInput([
                    gamepad.axes[2],
                    gamepad.axes[3],
                ]);
            }
        }, 100);
    }

    cleanAxisInput(axis: [number, number]) {
        // Invert the axis values to match the expected control direction
        return [-parseFloat(axis[0].toFixed(1)), -parseFloat(axis[1].toFixed(1))];
    }

    lastLeftJoystickInput: Axis = { x: 0, y: 0 };
    processLeftJoystickInput(axis: [number, number]) {
        const [x, y] = this.cleanAxisInput(axis);
        // if (
        //     x === this.lastLeftJoystickInput.x &&
        //     y === this.lastLeftJoystickInput.y
        // ) {
        //     return;
        // }
        this.lastLeftJoystickInput = { x, y };
        this.emit<Axis>('leftJoystick', { x, y });
    }

    lastRightJoystickInput: Axis = { x: 0, y: 0 };
    processRightJoystickInput(axis: [number, number]) {
        const [x, y] = this.cleanAxisInput(axis);
        // if (
        //     x === this.lastRightJoystickInput.x &&
        //     y === this.lastRightJoystickInput.y
        // ) {
        //     return;
        // }
        this.lastRightJoystickInput = { x, y };
        this.emit<Axis>('rightJoystick', { x, y });
    }

    //     mapAxisToControls(
    //         { x, y }: Axis,
    //         invertY = true,
    //     ): { left: number; right: number } {
    //         x = this.clamp(x, -1, 1);
    //         y = this.clamp(y, -1, 1);

    //         let degrees = Math.atan2(x, y) * (180 / Math.PI); // We purpose swap x and y so the rotation starts at 0 degrees and moves clockwise like on the joystick
    //         if (degrees < 0) degrees += 360; // Convert negative degrees to positive to fit the 0-360 degree range

    //         let left = 0;
    //         let right = 0;
    //         const isCentered = x === 0 && y === 0;

    //         if (!isCentered) {
    //             // If the joystick is not in the center
    //             if (invertY) {
    //                 /**
    //                  * Invert Y
    //                  * { x: 0, y: 1 } -> { left: -90, right: -90 } = 0 degrees
    //                  *      { x: 1, y: 1 } -> { left: -90, right: 0 } = 45 degrees
    //                  * { x: 1, y: 0 } -> { left: -90, right: 90 } = 90 degrees
    //                  *      { x: 1, y: -1 } -> { left: 0, right: 90 } = 135 degrees
    //                  * { x: 0, y: -1 } -> { left: 90, right: 90 } = 180 degrees
    //                  *      { x: -1, y: -1 } -> { left: 90, right: 0 } = 225 degrees
    //                  * { x: -1, y: 0 } -> { left: 90, right: -90 } = 270 degrees
    //                  *      { x: -1, y: 1 } -> { left: 0, right: -90 } = 315 degrees
    //                  */
    //                 if (degrees < 90) {
    //                     left = this.mapValue(degrees, 0, 90, -90, -90); // Left aileron is always -90 degrees in this range
    //                     right = this.mapValue(degrees, 0, 90, -90, 90);
    //                 } else if (degrees < 180) {
    //                     left = this.mapValue(degrees, 90, 180, -90, 90);
    //                     right = this.mapValue(degrees, 90, 180, 90, 90); // Right aileron is always 90 degrees in this range
    //                 } else if (degrees < 270) {
    //                     left = this.mapValue(degrees, 180, 270, 90, 90); // Left aileron is always 90 degrees in this range
    //                     right = this.mapValue(degrees, 180, 270, 90, -90);
    //                 } else {
    //                     // degrees < 360
    //                     left = this.mapValue(degrees, 270, 360, 90, -90);
    //                     right = this.mapValue(degrees, 270, 360, -90, -90); // Right aileron is always -90 degrees in this range
    //                 }
    //             } else {
    //                 /**
    //                  * Non-Inverted Y
    //                  * { x: 0, y: 1 } -> { left: 90, right: 90 } = 0 degrees
    //                  *      { x: 1, y: 1 } -> { left: 0, right: 90 } = 45 degrees
    //                  * { x: 1, y: 0 } -> { left: -90, right: 90 } = 90 degrees
    //                  *      { x: 1, y: -1 } -> { left: -90, right: 0 } = 135 degrees
    //                  * { x: 0, y: -1 } -> { left: -90, right: -90 } = 180 degrees
    //                  *      { x: -1, y: -1 } -> { left: 0, right: -90 } = 225 degrees
    //                  * { x: -1, y: 0 } -> { left: 90, right: -90 } = 270 degrees
    //                  *      { x: -1, y: 1 } -> { left: 90, right: 0 } = 315 degrees
    //                  */
    //                 if (degrees < 90) {
    //                     left = this.mapValue(degrees, 0, 90, 90, -90);
    //                     right = this.mapValue(degrees, 0, 90, 90, 90); // Right aileron is always 90 degrees in this range
    //                 } else if (degrees < 180) {
    //                     left = this.mapValue(degrees, 90, 180, -90, -90); // Left aileron is always -90 degrees in this range
    //                     right = this.mapValue(degrees, 90, 180, 90, -90);
    //                 } else if (degrees < 270) {
    //                     left = this.mapValue(degrees, 180, 270, -90, 90);
    //                     right = this.mapValue(degrees, 180, 270, -90, -90); // Right aileron is always -90 degrees in this range
    //                 } else {
    //                     // degrees < 360
    //                     left = this.mapValue(degrees, 270, 360, 90, 90); // Left aileron is always 90 degrees in this range
    //                     right = this.mapValue(degrees, 270, 360, -90, 90);
    //                 }
    //             }
    //         }

    //         return {
    //             left: left,
    //             right: right,
    //         };
    //     }

    //     clamp(value: number, min: number, max: number) {
    //         return Math.min(Math.max(value, min), max);
    //     }

    //     mapValue(
    //         value: number,
    //         inMin: number,
    //         inMax: number,
    //         outMin: number,
    //         outMax: number,
    //     ) {
    //         return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    //     }
}
