import { ModuleLoader } from 'src/module-loader';
import { Broadcaster } from 'src/broadcaster';
import { Config } from './config';
import { createContainer, InjectionMode, asClass, AwilixContainer } from 'awilix';
import { Connection } from './connection';
import { Application } from './application';

export interface ApplicationDependencies {
    namespace: string;
    config: Config;
    broadcaster: Broadcaster;
    moduleLoader: ModuleLoader;
    connection: Connection;
    application: Application;
    [key: string]: any;
}
export type Container = AwilixContainer<ApplicationDependencies>;

const container = createContainer<ApplicationDependencies>({
    injectionMode: InjectionMode.PROXY,
    strict: true,
});

container.register({
    'config': asClass(Config).singleton(),
    'broadcaster': asClass(Broadcaster).singleton(),
    'moduleLoader': asClass(ModuleLoader).singleton(),
});

export { container };