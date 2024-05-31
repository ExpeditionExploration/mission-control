import { Module } from 'src/module';
import { RollFooterItem } from './components/RollFooterItem';
import { UserInterface } from 'src/client/user-interface';
import { ClientModuleDependencies } from 'src/client/client';
import { PitchFooterItem } from './components/PitchFooterItem';

export class AngleModuleView extends Module {
    userInterface: UserInterface;

    constructor(deps: ClientModuleDependencies) {
        super(deps);
        this.userInterface = deps.userInterface;
    }

    onModuleInit(): void | Promise<void> {
        this.userInterface.addFooterItem(RollFooterItem);
        this.userInterface.addFooterItem(PitchFooterItem);
    }
}
