import { Injectable } from 'src/inject';

import { Fragment } from 'react';
import ReactDOM from 'react-dom/client';
import { Application } from './Application';
import './index.css';

@Injectable()
export class UserInterfaceLoader {
    contextItems: Set<JSX.Element> = new Set();
    headerLeftItems: Set<JSX.Element> = new Set();
    headerRightItems: Set<JSX.Element> = new Set();
    footerLeftItems: Set<JSX.Element> = new Set();
    footerRightItems: Set<JSX.Element> = new Set();

    async init() {
        ReactDOM.createRoot(
            document.getElementById('root') as HTMLElement,
        ).render(
            <Fragment>
                <Application
                    contextItems={Array.from(this.contextItems)}
                    headerLeftItems={Array.from(this.headerLeftItems)}
                    headerRightItems={Array.from(this.headerRightItems)}
                    footerLeftItems={Array.from(this.footerLeftItems)}
                    footerRightItems={Array.from(this.footerRightItems)}
                />
            </Fragment>,
        );
    }
}
