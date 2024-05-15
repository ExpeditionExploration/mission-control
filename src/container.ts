import 'reflect-metadata';
import { container, delay, Lifecycle } from 'tsyringe';
import { ModuleLoader } from 'src/module-loader';
import { Module } from 'src/module';
import { Broadcaster } from 'src/broadcaster';
import { Config } from './config';

container.registerInstance('namespace', 'application')
container.registerSingleton(Config, Config);
container.registerSingleton(Broadcaster, Broadcaster);
container.register(Module, {
    useClass: Module
}, {
    lifecycle: Lifecycle.ContainerScoped
});
container.registerSingleton(ModuleLoader, ModuleLoader);

export { container };