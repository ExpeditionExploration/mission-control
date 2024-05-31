import { Module } from 'src/module';
import { Heading } from './types';

export class CompassModuleController extends Module {
    onModuleInit(): void | Promise<void> {
        setInterval(async () => {
            this.emit<Heading>('heading', (Math.random() - 0.5) * 360);
        }, 1000);
    }
}
