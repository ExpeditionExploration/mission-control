import { IConnection, Payload } from 'src/connection';
import { Inject, Injectable } from '@module';

import { Fragment, StrictMode, createContext, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { App, ApplicationContextType } from './App';
import './index.css';

@Injectable()
export class UserInterface {
    constructor(
        @Inject('Connection') private readonly connection: IConnection,
    ) {}
    private setContext?: React.Dispatch<
        React.SetStateAction<ApplicationContextType>
    >;
    async init() {
        this.setContext = await new Promise<
            React.Dispatch<React.SetStateAction<ApplicationContextType>>
        >((resolve) => {
            ReactDOM.createRoot(
                document.getElementById('root') as HTMLElement,
            ).render(
                <StrictMode>
                    <App contextReady={(setContext) => resolve(setContext)} />
                </StrictMode>,
            );
        });

        this.loadContext();
    }

    private loadContext() {
        this.setContext?.((prev) => {
            return {
                ...prev,
            };
        });
    }

    addContextItem(item: JSX.Element) {
        console.log('Add context item', item, this.setContext);
        this.setContext?.((prev) => {
            console.log('Add context item', item, prev);
            return {
                contextItems: [...prev.contextItems, item],
            };
        });
    }
}

export default UserInterface;
