import { IConnection, Payload } from 'src/connection';
import { Inject, Injectable } from '@module';

import { Fragment, StrictMode, createContext, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Application, ApplicationContextType } from './Application';
import './index.css';

@Injectable()
export class UserInterface {
    private setContext!: React.Dispatch<
        React.SetStateAction<ApplicationContextType>
    >;
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

        // this.loadContext();
    }

    // private loadContext() {
    //     this.setContext?.((prev) => {
    //         return {
    //             ...prev,
    //         };
    //     });
    // }

    addContextItem(item: JSX.Element) {
        this.setContext((prev) => {
            return {
                contextItems: [...prev.contextItems, item],
            };
        });
    }
}

export default UserInterface;
