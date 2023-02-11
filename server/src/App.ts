import { EventEmitter } from 'events';
import type { Express } from 'express';
import type { Server } from 'ws';

import type { Module, Controller } from './modules/Module';
import * as modules from './modules';
import logger from 'debug';
import express from 'express';
import WebSocket from 'ws';
import path from 'path';


// interface IAppProps {
//     server: Express;
//     socket: Server;
// }

export default function App() {
    const debug = logger('MissionControl:App');
    const app = express();
    const webserverPort = 16500;
    const websocketPort = 16501;
    const events = new EventEmitter();

    app.use(express.static('public'));

    const sockets = new WebSocket.Server({ port: websocketPort });
    sockets.on('connection', socket => {
        socket.on('close', () => debug('Client disconnected. Clients:', sockets.clients.size));
        socket.on('message', (message: string) => {
            try {
                const payload: SocketPayload = JSON.parse(message) as any;
                if (payload.module) {
                    events.emit(`Module:${payload.module}${payload.event ? `:${payload.event}` : ''}`, payload.data);
                } else {
                    throw new Error('Invalid payload, missing module');
                }
            } catch (error) {
                debug('Socket message error', error);
            }
        })
        debug('Client connected. Clients:', sockets.clients.size);
    });

    app.listen(webserverPort, () => {
        debug(`Mission Control server listening on port ${webserverPort}`);
    });

    function send(module: string, event: string = '', data: any) {
        const payload: SocketPayload = { module, event, data };
        sockets.clients.forEach(client => client.send(JSON.stringify(payload)));
    }

    Object.entries(modules).forEach(([name, module]) => {
        const Controller = module.controller as Controller;
        Controller({
            events,
            debug: logger(`MissionControl:Module:${name}`),
            send: (data: any, event?: string) => send(name, event, data)
        });
    })
}