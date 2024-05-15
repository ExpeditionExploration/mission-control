import { Inject, Injectable } from 'src/inject';
import { Module, IModule } from 'src/module';
// import { Connection } from '@connection';

@Injectable()
export class MediaController implements IModule {
    constructor(@Inject(Module) private readonly module: Module) { }
    onModuleInit(): void | Promise<void> {
        // setTimeout(() => {
        //     this.events.emit('random', Math.random());
        // })
        console.log('MediaController');
        // throw new Error('Method not implemented.');
    }
}
