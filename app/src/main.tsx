import 'reflect-metadata';
import { injectable, inject, Container } from 'inversify';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

@injectable()
class Connection {
    connected = Math.random();

    constructor() {}
    getConnection() {
        console.log('Connected', this.connected);
    }
}

@injectable()
class Module {
    constructor(@inject(Connection) public connection: Connection) {}
}

@injectable()
class Application {
    constructor(@inject(Connection) public connection: Connection, @inject(Module) public module: Module) {}
    log() {
        console.log('Foo');
        console.log('Connected', this.connection.connected);
        console.log('Connected', this.module.connection.connected);

        ReactDOM.createRoot(document.getElementById('root')!).render(
            <React.StrictMode>
                <App />
            </React.StrictMode>
        );
    }
}

var container = new Container();
container.bind<Application>(Application).to(Application).inSingletonScope();
container.bind<Connection>(Connection).to(Connection).inSingletonScope();
container.bind<Module>(Module).to(Module).inSingletonScope();

const app = container.get<Application>(Application);
app.log();
