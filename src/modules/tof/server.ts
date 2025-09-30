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
    }

    processConfig(): void | Promise<void> {
        this.logger.debug(            this.config.tof.server.vl53l5cx.i2cBus,
            this.config.tof.server.vl53l5cx.rangingFrequency
        );
        this.tofSensor = new TOF_VL53L5CX(
            this.config.tof.server.vl53l5cx.i2cBus,
            this.config.tof.server.vl53l5cx.rangingFrequency
        );
        setInterval(async () => {
            const data = this.tofSensor.getRangingData();
            if (data) {
                this.emit<ScanData>('data', data);
            }
        }, 1000 / 5); // 5 Hz
    }
}
