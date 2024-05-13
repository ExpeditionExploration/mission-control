import { Inject, Injectable, Module } from '@module';
import { Events } from '@events';
import UserInterface from 'src/client/user-interface';
import { Hello } from './ControlSettings';

@Injectable()
export class ControlView implements Module {
    constructor(
        @Inject(Events) private readonly events: Events,
        @Inject(UserInterface) private readonly userInterface: UserInterface,
    ) {}

    onModuleInit(): void | Promise<void> {
        console.log('ControlView', this.userInterface);
        this.userInterface.addContextItem(
            <Hello
                onClick={() => {
                    console.log('Hello', this.events);
                }}
            />,
        );
    }
}
