import type { Debugger } from 'debug';
import type { EventEmitter } from 'events';
export enum Location {
    Header,
    BottomLeft,
    BottomRight,
    Menu,
    Window,
    Hidden,
}

// type EmitData = Record<string, any>
export type EmitFunction = (event: string, data?: any) => void;

type OnEventCallback = (data: any) => void;
export type OnFunction = (event: string, callback: OnEventCallback) => void;

export type Controller = (props: { events: EventEmitter; on: OnFunction; emit: EmitFunction; log: Debugger }) => void;

// type EventPayload = {
//     data: any;
//     module: string;
// };
type ControllerArray = Array<Controller>;

export type Module = ControllerArray | Controller;

export type SocketPayload = {
    event: string;
    data: any;
};
