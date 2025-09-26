import { Module } from 'src/module';
import { ServerModuleDependencies } from 'src/server/server';
import { TOF_VL53L5CX } from './class/TOF';
import { ScanData } from './types';

export class TOFModuleServer extends Module {
    private tofSensor = new TOF_VL53L5CX(1);  // Takes i2c bus as argument

    constructor(deps: ServerModuleDependencies) {
        super(deps);
    }
    onModuleInit(): void | Promise<void> {

        setInterval(async () => {
            const data = this.tofSensor.getRangingData();
            this.emit<ScanData>('data', data);
        }, 1000 / 5); // 5 Hz
    }
}
