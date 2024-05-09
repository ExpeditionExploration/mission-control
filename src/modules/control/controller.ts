import { Inject, Injectable, Module } from '@module';
import { Events } from '@events';
// import { Connection } from '@connection';

@Injectable()
export default class ControlController implements Module {
    constructor(@Inject(Events) private readonly events: Events) { }
    onModuleInit(): void | Promise<void> {
        console.log('ControlController', this.events)
        // throw new Error('Method not implemented.');
    }
}
