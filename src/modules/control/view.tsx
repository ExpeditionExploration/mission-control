import { Inject, Injectable, Module } from '@module';
import { Events } from '@events';

@Injectable()
export default class ControlView implements Module {
    constructor(@Inject(Events) private readonly events: Events) {}

    onModuleInit(): void | Promise<void> {
        console.log('ControllerView', this.events);
        // throw new Error('Method not implemented.');
    }
}
