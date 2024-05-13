import 'reflect-metadata';

import './App.css';
import { Fragment } from 'react';
import ReactDOM from 'react-dom/client';
import { Root } from './root';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <Fragment>
        <Root />
    </Fragment>,
);
