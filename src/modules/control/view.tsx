import { Module } from 'src/module';
import { UserInterface } from 'src/client/user-interface';
import { ClientModuleDependencies } from 'src/client/client';
import { Axis } from './types';

export class ControlModuleView extends Module {
    userInterface: UserInterface;
    constructor(deps: ClientModuleDependencies) {
        super(deps);
        this.userInterface = deps.userInterface;
    }

    gamepadLoop: NodeJS.Timeout | null = null;
    setGamepad(gamepad: Gamepad) {
        console.log('Gamepad connected', gamepad);
        if (this.gamepadLoop) {
            clearInterval(this.gamepadLoop);
        }

        this.gamepadLoop = setInterval(() => {
            const axes = gamepad.axes.map((axis) => axis.toFixed(2));
            const buttons = gamepad.buttons.map((button) => button.pressed);
            console.log('Gamepad', axes, buttons);
        }, 100);
    }

    onModuleInit(): void | Promise<void> {
        // window.addEventListener('gamepadconnected', (e) => {
        //     this.setGamepad(e.gamepad);
        // });

        setInterval(() => {
            const [gamepad] = navigator.getGamepads();
            if (gamepad) {
                this.processThrusterInput([gamepad.axes[0], gamepad.axes[1]]);
                this.processAileronInput([gamepad.axes[2], gamepad.axes[3]]);
            }
        }, 100);
    }

    cleanAxisInput(axis: [number, number]) {
        return [parseFloat(axis[0].toFixed(2)), parseFloat(axis[1].toFixed(2))];
    }
    processThrusterInput(axis: [number, number]) {}
    processAileronInput(axis: [number, number]) {
        const [x, y] = this.cleanAxisInput(axis);

        this.emit<Axis>('aileron', { x, y });
    }
}
