import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import type Module from '../Module';
import WebSocket, { Server } from 'ws';
import cp from 'child_process';
import logger from 'debug';
import { Transform } from 'stream';

const debug = logger('MissionControl:Module:Media:CameraStream');


const Pipe2Jpeg: {
    new (): Transform;
} = require('pipe2jpeg');

const p2j = new Pipe2Jpeg();

const websocketPort = 16502;
let sockets = new WebSocket.Server({ port: websocketPort });
let stream: ChildProcessWithoutNullStreams | null = null;

sockets.on('connection', socket => {
    debug('Client connected. Clients:', sockets.clients.size);
    socket.onclose = () => {
        debug('Client disconnected. Clients:', sockets.clients.size);
    }
    
    p2j.on('data', function (data: Buffer) {
        socket.send(data, { binary: true });
    });
});

function startStream() {
    stream = spawn('v4l2-ctl -d4 --stream-mmap --stream-to -', { shell: true });
    stream.stdout.pipe(p2j);

    stream.on("exit", function (code) {
        debug("Camera Stream Exit", code);
    });
}

try {
    startStream();
} catch (err) {
    debug("Camera Failure", err);
}