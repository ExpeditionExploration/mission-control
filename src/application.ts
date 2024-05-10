import 'reflect-metadata';
import { Inject, Injectable } from '@module';
import { ModuleLoader, ModulesImport } from 'src/module-loader';
import Events from '@events';
import Connection, { type IConnection } from './connection';

// @Injectable()
export class Application {
    constructor(@Inject(ModuleLoader) private readonly moduleLoader: ModuleLoader, @Inject(Events) private readonly events: Events, @Inject(Connection) private readonly connection: IConnection) { }
    async init(modules: ModulesImport) {
        await Promise.all([
            this.moduleLoader.init(container, modules),
            this.connection.init()
        ]);
    }
}