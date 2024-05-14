import { IConnection, Payload } from 'src/connection';
import { Inject, Injectable } from '@module';

import { Fragment, StrictMode, createContext, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Application, ApplicationContextType } from './Application';
import './index.css';
import ViewLoader from './view-loader';

@Injectable()
export class Interface {
    constructor(@Inject(ViewLoader) private readonly viewLoader: ViewLoader) {}
    addContextItem(item: JSX.Element) {
        this.viewLoader.setContext((prev) => {
            return {
                ...prev,
                contextItems: [...prev.contextItems, item],
            };
        });
    }
}

export default Interface;
