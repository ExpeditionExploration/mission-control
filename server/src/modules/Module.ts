import type { EventEmitter } from 'events';

export type Controller = (props: {
    events: EventEmitter,
    send: (data: any) => void
}) => void;

export type Module = {
    controller: Controller
}

export default Module;