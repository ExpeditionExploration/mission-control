import cp from 'child_process';
import path from 'path';

import { EventEmitter } from 'events';
import debug from 'debug';
import { SocketPayload } from './types';

import express from 'express';
import WebSocket from 'ws';

const log = debug('MissionControl:App');
const webserverPort = 16500;
const websocketPort = 16501;

const app = express();
app.use(express.static('public'));
app.listen(webserverPort, () => {
    log(`Mission Control server listening on port ${webserverPort}, sockets on ${websocketPort}`);
});

// Load modules as child processes
// I've moved this to a separate thread so that comms don't interfere with GPIO.
// I noticed when these ran in the same thread it caused the PWM to become intermittent.
const modules = cp.fork(path.join(__dirname, './modules'));

// When recieving a message from a module, send it to all clients
modules.on('message', (payload: SocketPayload) => {
    sockets.clients.forEach(client => client.send(JSON.stringify(payload)));
});

const sockets = new WebSocket.Server({ port: websocketPort });
sockets.on('connection', socket => {
    socket.on('close', () => log('Client disconnected. Clients:', sockets.clients.size));
    socket.on('message', (message: string) => {
        log('New message from client', message);
        try {
            // Send the message from the client to the modules
            const payload: SocketPayload = JSON.parse(message) as any;
            modules.send(payload);
        } catch (error) {
            log('Socket message error', error);
        }
    })
    log('Client connected. Clients:', sockets.clients.size);
});



