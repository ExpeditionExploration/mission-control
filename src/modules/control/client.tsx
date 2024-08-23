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
                this.processThrusterInput([gamepad.axes[0], gamepad.axes[1]]);
                this.processAileronInput([gamepad.axes[2], gamepad.axes[3]]);
            }
        }, 100);
    }

    cleanAxisInput(axis: [number, number]) {
        return [parseFloat(axis[0].toFixed(1)), parseFloat(axis[1].toFixed(1))];
    }

    lastThrusterInput: Axis = { x: 0, y: 0 };
    processThrusterInput(axis: [number, number]) {
        const [x, y] = this.cleanAxisInput(axis);
        if (x === this.lastThrusterInput.x && y === this.lastThrusterInput.y) {
            return;
        }
        this.lastThrusterInput = { x, y };

        this.emit<Axis>('thrusters', { x, y });
    }

    lastAileronInput: Axis = { x: 0, y: 0 };
    processAileronInput(axis: [number, number]) {
        const [x, y] = this.cleanAxisInput(axis);
        if (x === this.lastAileronInput.x && y === this.lastAileronInput.y) {
            return;
        }
        this.lastAileronInput = { x, y };

        this.emit<Axis>('ailerons', { x, y });
    }
}
