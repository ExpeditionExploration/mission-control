import { EventEmitter } from 'events';
import type System from '../System';
export default class ServerModule extends EventEmitter {
    static id = '';
    declare system: System;
    constructor(system: System) {
        super();
        this.system = system;
        const module = <typeof ServerModule>this.constructor;
        console.log(`Loading module: ${module.id}`);
    }

    send(data: any) {
        const module = <typeof ServerModule>this.constructor;
        this.system.broadcast(module.id, data);
    }
}