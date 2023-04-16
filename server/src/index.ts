import cp from 'child_process';
import path from 'path';

import { EventEmitter } from 'events';
import logger from 'debug';
import { SocketPayload } from './types';

import express from 'express';
import WebSocket from 'ws';

const debug = logger('MissionControl:App');
const webserverPort = 16500;
const websocketPort = 16501;
// const events = new EventEmitter();

const app = express();
app.use(express.static('public'));
app.listen(webserverPort, () => {
    console.log(`Mission Control server listening on port ${webserverPort}, sockets on ${websocketPort}`);
});

// Load modules as child processes
const modules = cp.fork(path.join(__dirname, './modules'));

// When recieving a message from a module, send it to all clients
modules.on('message', (payload: SocketPayload) => {
    sockets.clients.forEach(client => client.send(JSON.stringify(payload)));
});

const sockets = new WebSocket.Server({ port: websocketPort });
sockets.on('connection', socket => {
    socket.on('close', () => debug('Client disconnected. Clients:', sockets.clients.size));
    socket.on('message', (message: string) => {
        try {
            // Send the message from the client to the modules
            const payload: SocketPayload = JSON.parse(message) as any;
            modules.send(payload);
        } catch (error) {
            console.error('Socket message error', error);
        }
    })
    console.log('Client connected. Clients:', sockets.clients.size);
});



