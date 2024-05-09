import 'reflect-metadata';
import { Inject, Injectable } from '@';
import { Container } from 'inversify';
import { ModuleLoader, ModuleType } from 'src/module-loader';

@Injectable()
class Application {
    constructor(@Inject(ModuleLoader) private readonly moduleLoader: ModuleLoader) { }
    async init(container: Container) {
        await this.moduleLoader.initModules(container, ModuleType.Controller);
        // const modules = container.createChild();
    }
}

// container.bind<EventBroadcaster>(EventBroadcaster).to(EventBroadcaster).inRequestScope();
// container.bind<Application>(Application).to(Application).inSingletonScope();
// container.bind<Connection>(Connection).to(Connection).inSingletonScope();
// module.bind<string>('context').toConstantValue('control');
// module.bind<Mod>(Mod).to(Mod).inSingletonScope();

async function bootstrap() {
    const container = new Container();
    container.bind<string>('context').toConstantValue('root');

    const app = container.get<Application>(Application);
    await app.init(container);
}

bootstrap();
