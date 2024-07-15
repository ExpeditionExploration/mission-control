import { Module } from 'src/module';
import {Angle, Heading} from './types';
import { BNO08X } from 'openi2c';

export class AngleModuleController extends Module {
    onModuleInit(): void | Promise<void> {
        const bno = new BNO08X();

        setInterval(async () => {
            const heading = await bno.heading();
            const angle = await bno.euler();

            this.emit<Heading>('heading', heading);
            this.emit<Angle>('angle', angle);
        }, 1000);
    } 
}
