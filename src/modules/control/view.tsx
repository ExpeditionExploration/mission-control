import { Inject, Injectable, Module } from '@module';
import { Events } from '@events';
import UserInterface from 'src/client/user-interface';

@Injectable()
export default class ControlView implements Module {
    constructor(
        @Inject(Events) private readonly events: Events,
        @Inject(UserInterface) private readonly userInterface: UserInterface,
    ) {}

    onModuleInit(): void | Promise<void> {
        console.log('ControlView', this.events);
        this.userInterface.addContextItem(<div>Hello World</div>);
    }
}

function Hello() {
    return <div>Hello World</div>;
}
