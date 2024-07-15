import { Module } from 'src/module';
import {Angle, Heading} from './types';

import { BNO08X, BNO_REPORT_ACCELEROMETER, BNO_REPORT_MAGNETOMETER} from 'openi2c/dist/modules/BNO08X';

export class AngleModuleController extends Module {
    async onModuleInit() {
        const bno = new BNO08X();
        await bno.init();
        
        await bno.enableFeature(BNO_REPORT_ACCELEROMETER);
        await bno.enableFeature(BNO_REPORT_MAGNETOMETER);

        setInterval(async () => {
            const heading = await bno.heading();
            const angle = await bno.euler();

            this.emit<Heading>('heading', heading);
            this.emit<Angle>('angle', angle);
        }, 1000);
    } 
}
