import 'reflect-metadata';
import { Module, Inject } from '@';
import { Container } from 'inversify';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

@Module()
class Connection {
    connected = Math.random();

    constructor() {}
    getConnection() {
        console.log('Connected', this.connected);
    }
}

@Module()
class EventBroadcaster {
    connected = Math.random();

    constructor(@Inject('context') public context: string) {}
    log() {
        console.log('Broadcast', this.context);
    }
}

@Module()
class Mod {
    constructor(
        @Inject(Connection) public connection: Connection,
        @Inject(EventBroadcaster) public evb: EventBroadcaster
    ) {}
    log() {
        this.connection.getConnection();
        this.evb.log();
    }
}

@Module()
class Application {
    constructor(
        @Inject(Connection) public connection: Connection,
        @Inject(EventBroadcaster) public evb: EventBroadcaster
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
module.bind<Mod>(Mod).to(Mod).inSingletonScope();

const app = container.get<Application>(Application);
app.log();

const mod = module.get<Mod>(Mod);
mod.log();
