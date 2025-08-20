import { Module } from 'src/module';
import { SpatialHeaderButton } from './components/SpatialHeaderButton';
import { UserInterface } from 'src/client/user-interface';
import { ClientModuleDependencies } from 'src/client/client';
import { Payload } from 'src/connection';
import { Orientation, Acceleration } from '../imu/types';
import { AngleStatus } from './types';

// Module internal types


export class SpatialModuleClient extends Module {
    userInterface: UserInterface;
    private spatialChannel: BroadcastChannel;

    constructor(deps: ClientModuleDependencies) {
        super(deps);
        this.userInterface = deps.userInterface;
        this.spatialChannel = new BroadcastChannel('spatial-window');
    }

    rad2deg(radians: number): number {
        return radians * (180 / Math.PI);
    }

    onModuleInit(): void | Promise<void> {
        console.log('Spatial Module Client Initialized');
        this.userInterface.addFooterItem(SpatialHeaderButton);
        this.broadcaster.on('imu:orientationReceived', (payload: Payload) => {
            const imuOrientation = payload.data.map(a => this.rad2deg(a)) as Orientation;
            const angleStatus: AngleStatus = {
                // TODO: Align IMU and spatial angles order
                angle: [-imuOrientation[0], -imuOrientation[2], -imuOrientation[1]],
                heading: this.rad2deg(imuOrientation[2]),
            }
            this.sendStatusPayloadToWindow({
                event: 'orientation',
                namespace: 'angle',
                data: angleStatus,
            });
        })
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
