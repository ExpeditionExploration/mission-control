import { Module } from 'src/module';
import { ServerModuleDependencies } from 'src/server/server';
import { TOF_VL53L5CX } from './class/TOF';
import { ScanData } from './types';

export class TOFModuleServer extends Module {
    private tofSensor: TOF_VL53L5CX;

    constructor(deps: ServerModuleDependencies) {
        super(deps);
    }
    onModuleInit(): void | Promise<void> {
        if (!this.config.modules.tof.server.enabled) {
            return;
        }
        this.tofSensor = new TOF_VL53L5CX(
            this.config.modules.tof.server.vl53l5cx.i2cBus,
            this.config.modules.tof.server.vl53l5cx.rangingFrequency
        );
        setInterval(async () => {
            const data = this.tofSensor.getRangingData();
            if (data) {
                this.emit<ScanData>('data', data);
            }
        }, 1000 / 5); // 5 Hz
    }
}
