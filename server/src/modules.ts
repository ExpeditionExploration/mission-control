import { SocketPayload, Module } from './types';
import { EventEmitter } from 'events';
import debug from 'debug';
import { Worker } from './worker';
import config from './config';
import path from 'path';

const log = debug('MissionControl:Module');

const events = new EventEmitter();
class ModuleEventPayload {
    data: any = {};
    event: string = '';

    constructor(event: string, data: any) {
        this.event = event;
        this.data = data;
    }
}

process.on('message', (payload: SocketPayload) => {
    log('Recieved message from child', payload);

    // events.emit(`${payload.event}:_`, payload.data); // Emit the base event
    events.emit(payload.event, payload.data); // Emit any events that are specified
});

function send(event: string = '', data: any) {
    const payload: SocketPayload = { event, data };
    if (process.send) process.send(payload);
    else console.error('No process.send function found. Unable to send data to client.');
}

log('Loading modules', config.modules);

for (let modulePath of config.modules) {
    if (!path.isAbsolute(modulePath)) {
        modulePath = path.join(__dirname, modulePath);
    }

    import(modulePath).then((nodeModule) => {
        const module = nodeModule.default as Module;
        const namespace = `Module:${module.id}`;
        log(`Loading module ${module.id} as path ${modulePath}`);

        const moduleLogger = log.extend(module.id);
        let moduleWorker: Worker | undefined;
        if (module.worker) {
            let workerPath = module.worker;
            if (!path.isAbsolute(workerPath)) {
                workerPath = path.join(modulePath, workerPath);
            }
            log(`Loading worker ${workerPath} for module ${module.id}`);

            switch (path.extname(module.worker)) {
                case '.py':
                    moduleWorker = Worker.loadPythonWorker(workerPath, moduleLogger.extend('Worker'));
                    break;
                default:
                    console.error('Unknown worker type', module.worker);
                    break;
            }
        }
        // Load the module
        module({
            events,
            on: (event, callback) => {
                event = `${namespace}: ${event}`; // Namespace the event so that it doesn't conflict with other modules
                events.on(event, (payload: ModuleEventPayload | any) => {
                    log(`Event "${event}" fired`, payload);
                    callback(payload.data);
                });
            },
            emit: (event, data) => {
                event = `${namespace}: ${event}`;

                const payload = new ModuleEventPayload(event, data);
                log('Emitting', payload);
                events.emit(event, payload); // Emit to the events object so that other modules can listen to it
                send(event, data); // Send to the client
            },
            log: moduleLogger,
            worker: moduleWorker,
        });
    }).catch((error) => {
        console.error(`Error loading module`);
        console.error(error);
    });
}
