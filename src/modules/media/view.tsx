import { Inject, Injectable } from 'src/inject';
import { Module, IModule } from 'src/module';
import { View } from 'src/client/view';
import { UserInterface } from 'src/client/user-interface';

@Injectable()
export class MediaView implements IModule {
    constructor(
        @Inject(Module) private readonly module: Module,
        @Inject(UserInterface) private readonly userInterface: UserInterface,
    ) {}

    onModuleInit(): void | Promise<void> {
        console.log('MediaView');
        // this.userInterface.addContextItem(<View>World!</View>);
    }
}
