import { Module } from 'src/module';
import { Axis } from './types';

export class ControlModuleController extends Module {
    async onModuleInit() {
        this.on<Axis>('aileron', (data) => {
            console.log('Aileron', data);
        });
    }
}
