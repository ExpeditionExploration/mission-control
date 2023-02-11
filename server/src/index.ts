import cp from 'child_process';
import path from 'path';
// pigpio.configureClock(1, pigpio.CLOCK_PCM);
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
    debug(`Mission Control server listening on port ${webserverPort}`);
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
            if (payload.module) {
                modules.send(payload);
            } else {
                throw new Error('Invalid payload, missing module');
            }
        } catch (error) {
            debug('Socket message error', error);
        }
    })
    debug('Client connected. Clients:', sockets.clients.size);
});



