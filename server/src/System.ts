import { EventEmitter } from 'events';
import type { Express } from 'express';
import type { Server } from 'ws';
import * as modules from './modules';
import type ServerModule from './modules/ServerModule';

interface ISystemOptions {
    server: Express;
    socket: Server;
}

export default class System extends EventEmitter {
    declare server: Express;
    declare socket: Server;
    modules: { [key: string]: ServerModule } = {};

    constructor(options: ISystemOptions) {
        super();
        Object.assign(this, options);

        for (const [moduleId, Module] of Object.entries<typeof ServerModule>(modules)) {
            this.modules[moduleId] = new Module(this);
        }
    }

    broadcast(moduleId: string, data: any) {
        this.socket.clients.forEach(client => client.send(JSON.stringify({ module: moduleId, data }), { binary: true }));
    }
}