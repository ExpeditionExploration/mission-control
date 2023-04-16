import * as modules from './modules';
import { SocketPayload, Module } from '../types';
import { EventEmitter } from 'events';

const events = new EventEmitter();

process.on('message', (payload: SocketPayload) => {
    console.log('Recieved message from child', payload)

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
    console.debug(`Loading module ${name}`)

    for (const controller of controllerArray) {
        console.debug(`Loading ${name} controller`)
        controller({
            events,
            on: (...args: any[]) => {
                let event = id;
                let callback = () => { };

                if (args.length == 1) {
                    callback = args[0];
                    event += `:_`; // Default event must not be blank so that when the module emits a base event, it doesn't trigger the default event and create an infinite loop
                } else if (args.length == 2) {
                    event += `:${args[0]}`;
                    callback = args[1];
                }
                events.on(event, callback)
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
                console.log('Emitting', event, data)
                events.emit(event, data) // Emit to the events object so that other modules can listen to it
                send(event, data) // Send to the server
            }
        })
    }
}