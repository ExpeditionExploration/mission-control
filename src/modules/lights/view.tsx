import { Module } from 'src/module';
import { LightingGridController } from './components/LightingGridController';
import { Side, UserInterface } from 'src/client/user-interface';
import { ClientModuleDependencies } from 'src/client/client';

export class LightsModuleView extends Module {
    userInterface: UserInterface;

    constructor(deps: ClientModuleDependencies) {
        super(deps);
        this.userInterface = deps.userInterface;
    }

    onModuleInit(): void | Promise<void> {
        this.userInterface.addHeaderItem(LightingGridController, {
            side: Side.Right,
        });
    }
}
