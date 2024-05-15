import { Inject, Injectable } from 'src/inject';
import { Module } from 'src/module';
import { UserInterface } from 'src/client/user-interface';
import { ControlSettings } from './control-settings';

@Injectable()
export class ControlView extends Module {
    @Inject(UserInterface) private readonly userInterface!: UserInterface;

    onModuleInit(): void | Promise<void> {
        console.log('ControlView');
        // this.userInterface.addContextItem(ControlSettings);
    }
}
