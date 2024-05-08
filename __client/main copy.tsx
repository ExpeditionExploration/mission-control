import 'reflect-metadata';
import { container, inject, singleton } from 'tsyringe';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

@singleton()
class Connection {
    connected = Math.random();

    constructor() {}
    getConnection() {
        console.log('Connected', this.connected);
    }
}

@singleton()
class Foo {
    constructor(@inject('connection') public connection: Connection) {}
    log() {
        console.log('Foo');
        console.log('Connected', this.connection.connected);

        ReactDOM.createRoot(document.getElementById('root')!).render(
            <React.StrictMode>
                <App />
            </React.StrictMode>
        );
    }
}

container.register('connection', Connection);
const instance = container.resolve(Foo);
instance.log();
