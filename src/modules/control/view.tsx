import { Module } from 'src/module';
import { ControlSettings } from './ControlSettings';
import { UserInterface } from 'src/client/user-interface';
import { ClientModuleDependencies } from 'src/client/client';

export class ControlModule extends Module {
    userInterface: UserInterface;
    constructor(deps: ClientModuleDependencies) {
        super(deps);
        this.userInterface = deps.userInterface;
    }
    onModuleInit(): void | Promise<void> {
        console.log('ControlView');
        this.userInterface.addContextItem(ControlSettings);
        this.userInterface.addHeaderItem(ControlSettings);
        this.userInterface.addFooterItem(ControlSettings);
    }
}
