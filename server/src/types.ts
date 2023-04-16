import type { EventEmitter } from 'events';
export enum Location {
    Header,
    BottomLeft,
    BottomRight,
    Menu,
    Window,
    Hidden
}

type EmitData = Record<string, any>
export type EmitFunction = (...args: [string, EmitData] | [EmitData]) => void

type OnEventCallback = (data: any) => void
export type OnFunction = (...args: [string, OnEventCallback] | [OnEventCallback]) => void

export type Controller = (props: {
    events: EventEmitter,
    on: OnFunction,
    emit: EmitFunction
}) => void;

type ControllerArray = Array<Controller>;

export type Module = ControllerArray | Controller;

export type SocketPayload = {
    event: string;
    data: any;
}