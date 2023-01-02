import express from 'express';
import WebSocket from 'ws';
import path from 'path';
import System from './System';

const app = express();
const webserverPort = 16500;
const websocketPort = 16501;

app.use(express.static('public'));
// app.get('/', function (req, res) {
//     res.redirect('/index.html');
// });


const wss = new WebSocket.Server({ port: websocketPort });
wss.on('connection', socket => {
    socket.on('close', () => console.log('Client disconnected. Clients: ', wss.clients.size));
    console.log('Client connected. Clients:', wss.clients.size);
});

const system = new System({
    server: app,
    socket: wss
});

app.listen(webserverPort, () => {
    console.log(`Mission Control server listening on port ${webserverPort}`)
});