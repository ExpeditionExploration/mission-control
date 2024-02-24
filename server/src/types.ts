import type { Debugger } from 'debug';
import type { EventEmitter } from 'events';
import type { Worker } from './worker';
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

export type Props = { events: EventEmitter; on: OnFunction; emit: EmitFunction; log: Debugger, worker?: Worker };
export interface ModuleInterface<T> {
    (props: T): void;
    id: string;
    worker?: string;
}
export type Module = ModuleInterface<Props>;
export type ModuleWithWorker = ModuleInterface<Props & { worker: Worker }>;


// type ControllerArray<T> = Array<T>;
// export type Module = ControllerArray<Controller> | Controller;


export type SocketPayload = {
    event: string;
    data: any;
};
