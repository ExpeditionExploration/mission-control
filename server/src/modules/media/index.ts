import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import type Module from '../Module';
import WebSocket, { Server } from 'ws';

const Splitter = require('stream-split');
const NALseparator = Buffer.from([0, 0, 0, 1]);//NAL break

const websocketPort = 16502;
export const Media: Module = {
    controller: ({
        events,
        send,
        debug
    }) => {
        let sockets = new WebSocket.Server({ port: websocketPort });
        let settingNals: any[] = [];
        let stream: ChildProcessWithoutNullStreams | null = null;

        // events.on('')
        // this.system.socket.on('connection', socket => {
        //     this.send({ type: 'connected' });
        // });

        sockets.on('connection', socket => {
            debug('Client connected. Clients:', sockets.clients.size);
            socket.onclose = () => {
                debug('Client disconnected. Clients:', sockets.clients.size);
            }
            settingNals.forEach(frame => socket.send(frame, { binary: true }));
        });

        function startStream() {
            stream = spawn('raspivid', [
                '-t', '0',
                '-o', '-',
                '-w', '1280',
                '-h', '720',
                '-fps', '30',
                '-pf', 'baseline',
                // '-roi', '0,0,0.995,1',
                '--sharpness', '50',
                '-ex', 'night',
                '-vs',
                '-ev', '10',
                '-awb', 'auto'
                // '--hflip',
                // '--vflip',
            ]);

            stream.on('error', function (err) {
                debug("Camera Failure", err);
            });

            stream.stdout.pipe(new Splitter(NALseparator)).on("data", (data: Buffer) => {
                let frame = Buffer.concat([NALseparator, data]);

                if (settingNals.length < 3) {
                    settingNals.push(frame);
                } else {
                    sockets.clients.forEach(function (socket) {
                        socket.send(frame, { binary: true });
                    });
                }
            });

            stream.on("exit", function (code) {
                debug("Camera Stream Exit", code);
            });
        }

        startStream();
    }
}