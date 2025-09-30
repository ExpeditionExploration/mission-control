import { Module } from 'src/module';
import { ClientModuleDependencies } from 'src/client/client';

export class IMUModuleClient extends Module {

    constructor(deps: ClientModuleDependencies) {
        super(deps)
    }

    onModuleInit(): void | Promise<void> {
    }

    onModuleConfigReceived(): void | Promise<void> {
    }
}
