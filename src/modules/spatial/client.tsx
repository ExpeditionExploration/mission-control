import { Module } from 'src/module';
import { SpatialHeaderButton } from './components/SpatialHeaderButton';
import { UserInterface } from 'src/client/user-interface';
import { ClientModuleDependencies } from 'src/client/client';
import { Payload } from 'src/connection';

export class SpatialModuleClient extends Module {
    userInterface: UserInterface;
    private spatialChannel: BroadcastChannel;

    constructor(deps: ClientModuleDependencies) {
        super(deps);
        this.userInterface = deps.userInterface;
        this.spatialChannel = new BroadcastChannel('spatial-window');
    }

    onModuleInit(): void | Promise<void> {
        console.log('Spatial Module Client Initialized');
        this.userInterface.addFooterItem(SpatialHeaderButton);
        this.broadcaster.on('*:status', (payload: Payload) =>
            this.sendStatusPayloadToWindow(payload),
        );
    }

    sendStatusPayloadToWindow(payload: Payload) {
        // Send via BroadcastChannel instead of postMessage
        this.spatialChannel.postMessage(payload);
    }

    openWindow() {
        const windowUrl = import.meta.env.DEV
            ? '/src/modules/spatial/window/index.html'
            : '/spatial.html'; // Built filename

       window.open(windowUrl, "spatialWindow", 'width=800,height=600');
    }

    destroy() {
        // Clean up BroadcastChannel when module is destroyed
        this.spatialChannel.close();
    }
}
