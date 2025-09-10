import { Module } from 'src/module';
import { RollFooterItem } from './components/RollFooterItem';
import { UserInterface } from 'src/client/user-interface';
import { ClientModuleDependencies } from 'src/client/client';
import { PitchFooterItem } from './components/PitchFooterItem';
import { CompassFooterItem } from './components/CompassFooterItem';
import { Orientation, Acceleration } from '../imu/types'
import { Payload } from 'src/connection';
import { Yaw, Pitch, Roll } from './components/types'
import { SpeedoMeterFooterItem } from './components/SpeedoMeterItem';

export class AngleModuleClient extends Module {
    userInterface: UserInterface;

    yaw: Yaw = 0
    pitch: Pitch = 0
    roll: Roll = 0

    constructor(deps: ClientModuleDependencies) {
        super(deps);
        this.userInterface = deps.userInterface;
    }

    rad2deg = (rad: number) => {
        return rad * 180 / Math.PI
    }

    onOrientation = (orientation: Orientation) => {
        this.emit<Yaw>('yaw', this.rad2deg(orientation[2]))
        this.emit<Pitch>('pitch', this.rad2deg(orientation[0]))
        this.emit<Roll>('roll', this.rad2deg(orientation[1]))
    }

    onModuleInit(): void | Promise<void> {
        this.userInterface.addFooterItem(CompassFooterItem);
        this.userInterface.addFooterItem(RollFooterItem);
        this.userInterface.addFooterItem(PitchFooterItem);
        this.userInterface.addFooterItem(SpeedoMeterFooterItem);
        this.broadcaster.on("imu:orientation", (payload: Payload) => {
            this.onOrientation(payload.data)
        })
    }
}
