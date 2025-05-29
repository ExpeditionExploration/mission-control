import { Fragment, JSX } from 'react';
import ReactDOM from 'react-dom/client';
import { Application } from './Application';
import './index.css';

type UserInterfaceItem = {
    element: JSX.Element;
    order: number;
};

export class UserInterfaceLoader {
    contextItems: Set<UserInterfaceItem> = new Set();
    headerLeftItems: Set<UserInterfaceItem> = new Set();
    headerRightItems: Set<UserInterfaceItem> = new Set();
    footerLeftItems: Set<UserInterfaceItem> = new Set();
    footerRightItems: Set<UserInterfaceItem> = new Set();

    async init() {
        console.log(
            Array.from(this.footerLeftItems)
                .sort((a, b) => a.order - b.order)
                .map((item) => item.element),
        );
        ReactDOM.createRoot(
            document.getElementById('root') as HTMLElement,
        ).render(
            <Fragment>
                <Application
                    contextItems={Array.from(this.contextItems)
                        .sort((a, b) => a.order - b.order)
                        .map((item) => item.element)}
                    headerLeftItems={Array.from(this.headerLeftItems)
                        .sort((a, b) => a.order - b.order)
                        .map((item) => item.element)}
                    headerRightItems={Array.from(this.headerRightItems)
                        .sort((a, b) => a.order - b.order)
                        .map((item) => item.element)}
                    footerLeftItems={Array.from(this.footerLeftItems)
                        .sort((a, b) => b.order - a.order)
                        .map((item) => item.element)}
                    footerRightItems={Array.from(this.footerRightItems)
                        .sort((a, b) => a.order - b.order)
                        .map((item) => item.element)}
                />
            </Fragment>,
        );
    }
}
