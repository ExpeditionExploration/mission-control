import  { Module } from 'src/module';
import { ClientModuleDependencies } from 'src/client/client';
import { BatteryStats } from './components/battery';
import { UserInterface } from 'src/client/user-interface';

export class BatteryModuleClient extends Module {
    userInterface: UserInterface

    constructor(deps: ClientModuleDependencies) {
        super(deps);
        this.userInterface = deps.userInterface;
    }

    onModuleInit(): void | Promise<void> {
        this.userInterface.addHeaderItem(BatteryStats);
    }

    onModuleConfigReceived(): void | Promise<void> {
    }
}