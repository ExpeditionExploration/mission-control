import * as modules from './modules';
import { SocketPayload, Module } from '../types';
import { EventEmitter } from 'events';
import debug from 'debug';

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
    log('Recieved message from child', payload)

    events.emit(`${payload.event}:_`, payload.data); // Emit the base event
    events.emit(payload.event, payload.data); // Emit any events that are specified
});

function send(event: string = '', data: any) {
    const payload: SocketPayload = { event, data };
    if (process.send) process.send(payload);
    else console.error('No process.send function found. Unable to send data to client.')
}

for (const [name, module] of Object.entries(modules as Record<string, Module>)) {
    const id = `Module:${name}`

    const controllerArray = Array.isArray(module) ? module : [module];
    log(`Loading module ${name}`)

    for (const controller of controllerArray) {
        log(`Loading ${name} controller`)
        controller({
            events,
            on: (...args: any[]) => {
                let event = id;
                let callback = (arg:any) => { };

                if (args.length == 1) {
                    callback = args[0];
                } else if (args.length == 2) {
                    event += `:${args[0]}`;
                    callback = args[1];
                }
                events.on(event, (payload: ModuleEventPayload | any) => {
                    if(payload instanceof ModuleEventPayload){
                        // Payload came from a module, check if the event is the same as the listener
                        // if so, don't fire the callback to prevent an infinite loop.
                        // This is because the base emit might be called from inside the base on function.

                        if(payload.event !== event){
                            callback(payload.data);
                        }
                    }else{
                        // Payload didn't come from inside a module.
                        callback(payload);
                    }
                })
            },
            emit: (...args: any[]) => {
                let event = id;
                let data = {};

                if (args.length == 1) {
                    data = args[0];
                } else if (args.length == 2) {
                    event += `:${args[0]}`;
                    data = args[1];
                }

                log('Emitting', event, data)

                const payload = new ModuleEventPayload(event, data);
                events.emit(event, payload) // Emit to the events object so that other modules can listen to it
                send(event, data) // Send to the server
            },
            log: log.extend(name)
        })
    }
}