import React from 'react';
import type { EventEmitter } from 'events';
import debug, { Debugger } from 'debug';

export type Controller = (props: {
    events: EventEmitter,
    send: (data: any, event?: string) => void,
    debug: Debugger
}) => JSX.Element | null;

export type Module = {
    controller?: Controller;
    window?: Controller;
    menu?: Controller;
    header?: Controller;
    left?: Controller;
    right?: Controller;
}

export default Module;