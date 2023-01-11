import React, { FunctionComponent } from 'react';
import type { EventEmitter } from 'events';
export type ModuleLocation = 'left' | 'right' | 'window' | 'menu' | 'header';

export type ClientModule = FunctionComponent<{
    events: EventEmitter,
    send: (data:any) => void
}> & {
    location: ModuleLocation;
    id: string;
    menu?: JSX.Element;
}