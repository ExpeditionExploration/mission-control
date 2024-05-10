import 'reflect-metadata';
import { container, delay, Lifecycle } from 'tsyringe';
import { ModuleLoader } from 'src/module-loader';
import Events from '@events';
import Broadcaster from 'src/broadcaster';
import { Config } from './config';

container.registerInstance('namespace', 'application')
container.registerSingleton(Config, Config);
container.registerSingleton(Broadcaster, Broadcaster);
container.register(Events, {
    useClass: Events
}, {
    lifecycle: Lifecycle.ContainerScoped
});
container.registerSingleton(ModuleLoader, ModuleLoader);

export { container };