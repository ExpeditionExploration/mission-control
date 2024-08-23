import { ModuleLoader } from 'src/module-loader';
import { Broadcaster } from 'src/broadcaster';
import { Config } from './config';
import { createContainer as createAwilixContainer, InjectionMode, asClass, AwilixContainer } from 'awilix';
import { Connection } from './connection';
import { Application } from './application';
import { Logger } from './logger';

export interface ApplicationDependencies {
    namespace: string;
    config: Config;
    broadcaster: Broadcaster;
    moduleLoader: ModuleLoader;
    connection: Connection;
    application: Application;
    logger: Logger;
}
export type Container = AwilixContainer<ApplicationDependencies>;

function createContainer() {
    const container = createAwilixContainer<ApplicationDependencies>({
        injectionMode: InjectionMode.PROXY,
        strict: true,
    });

    container.register({
        'config': asClass(Config).singleton(),
        'broadcaster': asClass(Broadcaster).singleton(),
        'moduleLoader': asClass(ModuleLoader).singleton(),
        'logger': asClass(Logger).scoped(),
    });

    return container;
}

export { createContainer };