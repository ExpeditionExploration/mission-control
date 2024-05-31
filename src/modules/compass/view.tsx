import { Module } from 'src/module';
import { CompassFooterItem } from './components/CompassFooterItem';
import { UserInterface } from 'src/client/user-interface';
import { ClientModuleDependencies } from 'src/client/client';

export class CompassModuleView extends Module {
    userInterface: UserInterface;

    constructor(deps: ClientModuleDependencies) {
        super(deps);
        this.userInterface = deps.userInterface;
    }

    onModuleInit(): void | Promise<void> {
        this.userInterface.addFooterItem(CompassFooterItem);
    }
}
