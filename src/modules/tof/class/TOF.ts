import { VL53L5CX } from 'vl53l5cx/dist/types';
import { ScanData } from '../types';
import { bindings as vl53l5cx } from 'vl53l5cx';


export class TOF_VL53L5CX {
    private sensor: VL53L5CX;
    private cfgSlot: number = 0;
    private resolution?: number;
    private rangingFrequency: number = 5;

    constructor(bus: number) {
        this.sensor = vl53l5cx;
        this.resolution = this.sensor.VL53L5CX_RESOLUTION_8X8;
        this.sensor.comms_init(this.cfgSlot, bus);
        this.sensor.init(this.cfgSlot);
        this.sensor.set_resolution(this.cfgSlot, this.resolution);
        this.sensor.set_ranging_frequency_hz(this.cfgSlot, this.rangingFrequency);
        this.sensor.set_target_order(
            this.cfgSlot, vl53l5cx.VL53L5CX_TARGET_ORDER_CLOSEST);
        this.sensor.start_ranging(this.cfgSlot);
    }

    getRangingData = (): ScanData => {
        const data: ScanData = this.sensor.get_ranging_data(this.cfgSlot);
        return data;
    }

    stopRanging = (): void => {
        this.sensor.stop_ranging(this.cfgSlot);
    }
}