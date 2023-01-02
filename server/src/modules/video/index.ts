import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import ServerModule from '../ServerModule';
import WebSocket, { Server } from 'ws';

const Splitter = require('stream-split');
const NALseparator = Buffer.from([0, 0, 0, 1]);//NAL break

const websocketPort = 16502;
export class Video extends ServerModule {
    static id = 'video';
    declare socket: Server;
    settingNals: any[] = [];
    stream: ChildProcessWithoutNullStreams | null = null;

    constructor(...args: [any]) {
        super(...args);

        this.settingNals = [];

        this.system.socket.on('connection', socket => {
            this.settingNals.forEach(frame => socket.send(frame, { binary: true }));
        });

        this.socket = new WebSocket.Server({ port: websocketPort });
        this.socket.on('connection', socket => {
            this.settingNals.forEach(frame => socket.send(frame, { binary: true }));
        });
        this.startStream();
    }

    startStream() {
        this.stream = spawn('libcamera-vid', [
            '-t', '0',
            '-o', '-',
            '--width', '1280',
            '--height', '720',
            '--framerate', '30',
            '-pf', 'baseline',
            // '-roi', '0,0,0.995,1',
            // '--sharpness', '50',
            // '-ex', 'night',
            // '-vs',
            // '-ev', '10'
            // --hflip,
            // --vflip,
        ]);
        this.stream.on('error', function (err) {
            console.error('Failed to start camera');
            console.error(err);
        });

        this.stream.stdout.pipe(new Splitter(NALseparator)).on("data", (data: Buffer) => {
            let frame = Buffer.concat([NALseparator, data]);

            if (this.settingNals.length < 3) {
                this.settingNals.push(frame);
            } else {
                this.socket.clients.forEach(function (socket) {
                    socket.send(frame, { binary: true });
                });
            }
        });

        this.stream.on("exit", function (code) {
            console.log("Camera Failure", code);
        });
    }
}