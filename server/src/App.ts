import { EventEmitter } from 'events';
import type { Express } from 'express';
import type { Server } from 'ws';

import type { Module, Controller } from './modules/Module';
import * as modules from './modules';

import express from 'express';
import WebSocket from 'ws';
import path from 'path';

type SocketPayload = {
    module: string;
    data: any;
}

// interface IAppProps {
//     server: Express;
//     socket: Server;
// }

export default function App() {
    const app = express();
    const webserverPort = 16500;
    const websocketPort = 16501;
    const events = new EventEmitter();

    app.use(express.static('public'));
    // app.get('/', function (req, res) {
    //     res.redirect('/index.html');
    // });


    const sockets = new WebSocket.Server({ port: websocketPort });
    sockets.on('connection', socket => {
        socket.on('close', () => console.log('Client disconnected. Clients: ', sockets.clients.size));
        socket.on('message', (message: string) => {
            try {
                const payload: SocketPayload = JSON.parse(message) as any;
                if (payload.module) {
                    events.emit(`module:${payload.module}`, payload.data);
                } else {
                    throw new Error('Invalid payload, missing module');
                }
            } catch (error) {
                console.error(error);
            }
        })
        console.log('Client connected. Clients:', sockets.clients.size);
    });

    app.listen(webserverPort, () => {
        console.log(`Mission Control server listening on port ${webserverPort}`)
    });

    function send(module: string, data: any) {
        const payload: SocketPayload = { module, data };
        sockets.clients.forEach(client => client.send(JSON.stringify(payload)));
    }

    Object.entries(modules).forEach(([name, module]) => {
        const Controller = module.controller as Controller;
        Controller({
            events,
            send: (data: any) => send(name, data)
        });
    })
}