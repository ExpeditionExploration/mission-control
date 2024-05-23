import { Module } from 'src/module';
import { StatsHeaderItem } from './components/StatsHeaderItem';
import { UserInterface } from 'src/client/user-interface';
import { ClientModuleDependencies } from 'src/client/client';
import { Stats } from './types';

export class StatsModule extends Module {
    userInterface: UserInterface;

    constructor(deps: ClientModuleDependencies) {
        super(deps);
        this.userInterface = deps.userInterface;
    }

    onModuleInit(): void | Promise<void> {
        this.userInterface.addHeaderItem(StatsHeaderItem);

        setInterval(() => {
            this.emit<Stats>(
                'stats',
                {
                    temperature: Math.random(),
                    cpu: Math.random(),
                    memory: Math.random(),
                    storage: Math.random(),
                },
                false,
            );
        }, 1000);
    }
}
