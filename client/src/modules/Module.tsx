import React from 'react';
import type { EventEmitter } from 'events';


export type Controller = (props: {
    events: EventEmitter,
    send: (data: any) => void
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