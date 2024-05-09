import 'reflect-metadata';
import { Inject, Injectable, container } from '@module';
import { Container } from 'inversify';
import { ModuleLoader, ModulesImport } from 'src/module-loader';
import Events from '@events';
import Broadcaster from 'src/broadcaster';
import { Config } from './config';
import Connection, { type IConnection } from './connection';

@Injectable()
export class Application {
    constructor(@Inject(ModuleLoader) private readonly moduleLoader: ModuleLoader, @Inject(Events) private readonly events: Events, @Inject(Connection) private readonly connection: IConnection) { }
    async init(container: Container, modules: ModulesImport) {
        await this.moduleLoader.initModules(container, modules);
        console.log('Application initialized', this.events);
        // const modules = container.createChild();
    }
}

container.bind<string>('namespace').toConstantValue('app');
container.bind<Application>(Application).to(Application).inSingletonScope();
container.bind<Config>(Config).to(Config).inSingletonScope();
container.bind<Broadcaster>(Broadcaster).to(Broadcaster).inSingletonScope();
container.bind<Events>(Events).to(Events).inRequestScope();
container.bind<ModuleLoader>(ModuleLoader).to(ModuleLoader).inSingletonScope();

export const application = container.get<Application>(Application);
export default application;