import { Module } from 'src/module';
import { ChildProcess, spawn } from 'child_process';
import { WebSocketServer } from 'ws';
import { Transform, Writable } from 'stream';
import { ModuleDependencies } from 'src/module-loader';

import * as p2j from 'pipe2jpeg';
const Pipe2Jpeg: {
    new (): Transform;
} = p2j.default;

export class MediaModuleServer extends Module {
    private wss!: WebSocketServer;
    private stream!: ChildProcess;
    private streamPipe: Writable = new Writable();

    private p2j = new Pipe2Jpeg();

    createMediaServer(): void {
        this.wss = new WebSocketServer({ port: 16600 });
        this.stream = spawn(
            'v4l2-ctl -d0 --set-fmt-video=width=1280,height=720 --stream-mmap --stream-to -',
            {
                shell: true,
            },
        );
        this.p2j.on('data', (data: Buffer) => {
            this.wss.clients.forEach((client) => {
                if (client.readyState === 1) {
                    client.send(data, { binary: true });
                }
            });
        });
        this.stream.stdout.pipe(this.p2j);
    }

    async onModuleInit() {
        this.logger.info('Starting media server');
        this.createMediaServer();
    }
}
