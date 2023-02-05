import type { EventEmitter } from 'events';
import debug, { Debugger } from 'debug';


export type Controller = (props: {
    events: EventEmitter,
    send: (data: any, event?: string) => void,
    debug: Debugger
}) => void;

export type Module = {
    controller: Controller
}

export default Module;