import { IConnection, Payload } from 'src/connection';
import { Inject, Injectable } from '@module';

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

@Injectable()
export class UserInterface {
    async init() {
        ReactDOM.createRoot(
            document.getElementById('root') as HTMLElement,
        ).render(
            <React.Fragment>
                <App />
            </React.Fragment>,
        );
    }
}

export default UserInterface;
