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
class EventBroadcaster {
    connected = Math.random();

    constructor(@inject('context') public context: string) {}
    log() {
        console.log('Broadcast', this.context);
    }
}

@injectable()
class Module {
    constructor(
        @inject(Connection) public connection: Connection,
        @inject(EventBroadcaster) public evb: EventBroadcaster
    ) {}
    log() {
        this.connection.getConnection();
        this.evb.log();
    }
}

@injectable()
class Application {
    constructor(
        @inject(Connection) public connection: Connection,
        @inject(EventBroadcaster) public evb: EventBroadcaster
    ) {}
    log() {
        this.connection.getConnection();
        this.evb.log();
        ReactDOM.createRoot(document.getElementById('root')!).render(
            <React.StrictMode>
                <App />
            </React.StrictMode>
        );
    }
}

var container = new Container();
const module = container.createChild();
container.bind<string>('context').toConstantValue('root');
container.bind<EventBroadcaster>(EventBroadcaster).to(EventBroadcaster).inRequestScope();
container.bind<Application>(Application).to(Application).inSingletonScope();
container.bind<Connection>(Connection).to(Connection).inSingletonScope();
module.bind<string>('context').toConstantValue('control');
module.bind<Module>(Module).to(Module).inSingletonScope();

const app = container.get<Application>(Application);
app.log();

const mod = module.get<Module>(Module);
mod.log();
