import React from 'react';
import type { EventEmitter } from 'events';
import type { Debugger } from 'debug';

export enum Location {
    Header,
    BottomLeft,
    BottomRight,
    Menu,
    Window,
    Hidden,
}

// export type Controller = (props: {
//     events: EventEmitter,
//     // send: (data: any, event?: string) => void,
//     on: (event: string, callback: (data: any) => void) => void,
//     emit: (event: string, data: any) => void,
// }) => JSX.Element | null;

export type EmitFunction = (event: string, data?: any) => void;

type OnEventCallback = (data: any) => void;
export type OnFunction = (event: string, callback: OnEventCallback) => void;

export type Controller = {
    location?: Location;
    (props: { events: EventEmitter; on: OnFunction; emit: EmitFunction; log: Debugger }): JSX.Element | null;
};

type ControllerArray = Array<Controller>;

export type Module = ControllerArray | Controller;

// export type Module = {
//     id: string;
//     [Location.Hidden]?: Controller;
//     [Location.Header]?: Controller;
//     [Location.BottomLeft]?: Controller;
//     [Location.BottomRight]?: Controller;
//     [Location.Menu]?: Controller;
//     [Location.Window]?: Controller;
// }

export type LoadedControllers = { [key in Location]: Array<JSX.Element | null> };
export type SocketPayload = {
    event: string;
    data: any;
};

// Create a typescript type that is a function with a static parameter

// export type Module = {
//     controller?: Controller;
//     window?: Controller;
//     menu?: Controller;
//     header?: Controller;
//     left?: Controller;
//     right?: Controller;
// }

// export type Module = {
//     id: string;
//     location: Location;
//     default: Controller;
// }
