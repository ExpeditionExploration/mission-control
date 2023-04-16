import * as modules from './modules';

import React from 'react'
import ReactDOM from 'react-dom/client'

import { Controller, Location, LoadedControllers, Module} from '../types';
import { EventEmitter } from 'events';

export default function loadModules({
    events,
    send
}: {
    events: EventEmitter,
    send: (event: string, data: any) => void
}): LoadedControllers {

    const loadedModules: LoadedControllers = {
        [Location.Header]: [],
        [Location.BottomLeft]: [],
        [Location.BottomRight]: [],
        [Location.Menu]: [],
        [Location.Window]: [],
        [Location.Hidden]: []
    }

    for (const [name, module] of Object.entries(modules as Record<string, Module>)) {
        const id = `Module:${name}`

        const controllerArray = Array.isArray(module) ? module : [module];
        console.debug(`Loading module ${name}`)

        for (const Controller of controllerArray) {
            console.debug(`Loading ${name} controller at ${Controller.location}`)
            
            loadedModules[Controller.location].push(<Controller
                key={`${id}:${Controller.location}`}
                events={events}
                on={(...args: any[]) => {
                    let event = id;
                    let callback = () => { };
                    
                    if (args.length == 1) {
                        callback = args[0];
                        event += `:_`; // Default event must not be blank so that when the module emits a base event, it doesn't trigger the default event and create an infinite loop
                    } else if (args.length == 2) {
                        event += `:${args[0]}`;
                        callback = args[1];
                    }
                    console.debug(`Listening to ${event}`)
                    events.on(event, callback)
                }}
                emit={(...args: any[]) => {
                    let event = id;
                    let data = {};

                    if (args.length == 1) {
                        data = args[0];
                    } else if (args.length == 2) {
                        event += `:${args[0]}`;
                        data = args[1];
                    }

                    events.emit(event, data) // Emit to the events object so that other modules can listen to it
                    send(event, data) // Send to the server
                }}
            />);
        }
    }

    return loadedModules;
}