import 'reflect-metadata';
import { Container } from 'inversify';
import { ModuleLoader } from 'src/module-loader';
import { Module } from 'src/module';
import { Broadcaster } from 'src/broadcaster';
import { Config } from './config';

const container = new Container();
container.bind<string>('namspace').toConstantValue('application');
container.bind<Config>(Config).to(Config).inSingletonScope();
container.bind<Broadcaster>(Broadcaster).to(Broadcaster).inSingletonScope();
container.bind<ModuleLoader>(ModuleLoader).to(ModuleLoader).inSingletonScope();
// container.registerSingleton(Config, Config);
// container.registerSingleton(Broadcaster, Broadcaster);
// container.register(Module, {
//     useClass: Module
// }, {
//     lifecycle: Lifecycle.ContainerScoped
// });
// container.registerSingleton(ModuleLoader, ModuleLoader);

export { container };