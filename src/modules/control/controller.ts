import { Injectable } from 'src/inject';
import { Module } from 'src/module';
// import { Connection } from '@connection';

@Injectable()
export class ControlController extends Module {
    onModuleInit(): void | Promise<void> {
        // setTimeout(() => {
        //     this.events.emit('random', Math.random());
        // })
        console.log('ControlController');
        // throw new Error('Method not implemented.');
    }
}
