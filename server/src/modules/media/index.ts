import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import type Module from '../Module';
import WebSocket, { Server } from 'ws';

const Splitter = require('stream-split');
const NALseparator = Buffer.from([0, 0, 0, 1]);//NAL break

const websocketPort = 16502;
export const Media: Module = {
    controller: ({
        events,
        send
    }) => {
        let socket = new WebSocket.Server({ port: websocketPort });
        let settingNals: any[] = [];
        let stream: ChildProcessWithoutNullStreams | null = null;

        // events.on('')
        // this.system.socket.on('connection', socket => {
        //     this.send({ type: 'connected' });
        // });

        socket.on('connection', socket => {
            settingNals.forEach(frame => socket.send(frame, { binary: true }));
        });

        function startStream() {
            stream = spawn('raspivid', [
                '-t', '0',
                '-o', '-',
                '-w', '1920',
                '-h', '1080',
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
                console.error('Failed to start camera');
                console.error(err);
            });

            stream.stdout.pipe(new Splitter(NALseparator)).on("data", (data: Buffer) => {
                let frame = Buffer.concat([NALseparator, data]);

                if (settingNals.length < 3) {
                    settingNals.push(frame);
                } else {
                    socket.clients.forEach(function (socket) {
                        socket.send(frame, { binary: true });
                    });
                }
            });

            stream.on("exit", function (code) {
                console.log("Camera Failure", code);
            });
        }

        startStream();
    }
}