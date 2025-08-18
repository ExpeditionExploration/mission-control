import { Module } from 'src/module';
import { SpatialHeaderButton } from './components/SpatialHeaderButton';
import { UserInterface } from 'src/client/user-interface';
import { ClientModuleDependencies } from 'src/client/client';
import { Payload } from 'src/connection';

export class SpatialModuleClient extends Module {
    userInterface: UserInterface;
    window: Window = null;

    constructor(deps: ClientModuleDependencies) {
        super(deps);
        this.userInterface = deps.userInterface;
    }

    onModuleInit(): void | Promise<void> {
        this.userInterface.addFooterItem(SpatialHeaderButton);
        this.broadcaster.on('*:status', (payload: Payload) =>
            this.sendStatusPayloadToWindow(payload),
        );
    }

    sendStatusPayloadToWindow(payload: Payload) {
        if(this.window) this.window.postMessage(payload, '*');
    }

    captureSpatialWindow(spatialWindow: Window) {
        this.window = spatialWindow;

        this.window.addEventListener('beforeunload', () => {
            this.window = null;
        });
    }
}
