import { Injectable } from 'src/inject';

import { Fragment } from 'react';
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
