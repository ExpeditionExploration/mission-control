import { IConnection, Payload } from 'src/connection';
import { Inject, Injectable } from '@module';

import { Fragment, StrictMode, createContext, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Application } from './Application';
import { ApplicationContextType } from './ApplicationContext';
import './index.css';

@Injectable()
export class ViewLoader {
    setContext!: React.Dispatch<React.SetStateAction<ApplicationContextType>>;
    async init() {
        this.setContext = await new Promise<
            React.Dispatch<React.SetStateAction<ApplicationContextType>>
        >((resolve) => {
            ReactDOM.createRoot(
                document.getElementById('root') as HTMLElement,
            ).render(
                <Fragment>
                    <Application
                        contextReady={(setContext) => resolve(setContext)}
                    />
                </Fragment>,
            );
        });
    }
}

export default ViewLoader;
