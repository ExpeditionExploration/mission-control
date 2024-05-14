import { Inject, Injectable, Module } from '@module';
import { Events } from '@events';
// import { Connection } from '@connection';

@Injectable()
export class ControlController implements Module {
    constructor(@Inject(Events) private readonly events: Events) { }
    onModuleInit(): void | Promise<void> {
        // setTimeout(() => {
        //     this.events.emit('random', Math.random());
        // })
        // console.log('ControlController');
        // throw new Error('Method not implemented.');
    }
}
