import { Module } from 'src/module';
import { ThreeDHeaderButton } from './components/ThreeDHeaderButton';
import { UserInterface } from 'src/client/user-interface';
import { ClientModuleDependencies } from 'src/client/client';

export class ThreeDViewModuleClient extends Module {
    userInterface: UserInterface;

    constructor(deps: ClientModuleDependencies) {
        super(deps);
        this.userInterface = deps.userInterface;
    }

    onModuleInit(): void | Promise<void> {
        this.userInterface.addHeaderItem(ThreeDHeaderButton);
    }
}
