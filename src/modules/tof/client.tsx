import { Module } from 'src/module';
import { UserInterface } from 'src/client/user-interface';
import { ClientModuleDependencies } from 'src/client/client';
import { ScanData } from '../tof/types';

export class TOFModuleClient extends Module {
    userInterface: UserInterface;

    constructor(deps: ClientModuleDependencies) {
        super(deps);
        this.userInterface = deps.userInterface;
    }
    
    rad2deg(radians: number): number {
        return radians * (180 / Math.PI);
    }

    onModuleInit(): void | Promise<void> {
        const spatialChannel = new BroadcastChannel('tof-data');

        this.on('data', (data: ScanData) => {
            spatialChannel.postMessage({
                event: 'data',
                namespace: 'tof',
                data,
            });
        })
    }
}
