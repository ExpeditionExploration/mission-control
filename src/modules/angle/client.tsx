import { Module } from 'src/module';
import { RollFooterItem } from './components/RollFooterItem';
import { UserInterface } from 'src/client/user-interface';
import { ClientModuleDependencies } from 'src/client/client';
import { PitchFooterItem } from './components/PitchFooterItem';
import { CompassFooterItem } from './components/CompassFooterItem';

export class AngleModuleClient extends Module {
    userInterface: UserInterface;

    constructor(deps: ClientModuleDependencies) {
        super(deps);
        this.userInterface = deps.userInterface;
    }

    onModuleInit(): void | Promise<void> {
        this.userInterface.addFooterItem(CompassFooterItem);
        this.userInterface.addFooterItem(RollFooterItem);
        this.userInterface.addFooterItem(PitchFooterItem);
    
    }
}
