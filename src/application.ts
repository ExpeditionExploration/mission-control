import 'reflect-metadata';
import { Inject, Injectable } from '@module';
import { Container } from 'inversify';
import { ModuleLoader, ModulesImport } from 'src/module-loader';
import Events from '@events';
import Connection, { type IConnection } from './connection';

@Injectable()
export class Application {
    constructor(@Inject(ModuleLoader) private readonly moduleLoader: ModuleLoader, @Inject(Events) private readonly events: Events, @Inject(Connection) private readonly connection: IConnection) { }
    async init(container: Container, modules: ModulesImport) {
        await Promise.all([
            this.moduleLoader.initModules(container, modules),
            this.connection.init()
        ]);
        console.log('Application initialized');
        this.events.on('ping', (data) => {
            console.log('Ping', data);
        })

        setInterval(() => {
            this.events.emit('ping', Math.random());
        }, 5000)
        // const modules = container.createChild();
    }
}