import { Module } from 'src/module';
import { ChildProcess, spawn } from 'child_process';
import { WebSocketServer } from 'ws';
import { Writable } from 'stream';

export class MediaModuleController extends Module {
    private wss!: WebSocketServer;
    private stream!: ChildProcess;
    private streamPipe: Writable = new Writable();

    createMediaServer(): void {
        this.wss = new WebSocketServer({ port: 16600 });
        this.streamPipe._write = (chunk, encoding, callback) => {
            this.wss.clients.forEach((client) => {
                if (client.readyState === 1) {
                    client.send(chunk);
                }
            });
            callback();
        };
        // this.streamPipe.on('data', (chunk) => {
        //     this.wss.clients.forEach((client) => {
        //         if (client.readyState === 1) {
        //             client.send(chunk);
        //         }
        //     });
        // });

        // createServer((req, res) => {
        //     // this.streamFile = fs.createReadStream(STREAM_FILE_PATH);
        //     console.log('Media server request');
        //     res.writeHead(200, {
        //         'Content-Type': 'video/mp4',
        //     });
        //     // res.setHeader('Transfer-Encoding', 'chunked');
        //     // res.setHeader('Connection', 'keep-alive');
        //     // fifoStream.pipe(res);
        //     this.streamFile.pipe(res);
        // }).listen(16600, () => {
        //     console.log('Media server is running on http://localhost:16600');
        // });
    }
    startMediaStream(): void {
        console.log('Starting media stream')
        // try {
        //     fs.unlinkSync(STREAM_FILE_PATH);

        // } catch (e) { }

        this.stream = spawn('ffmpeg', [
            '-loglevel', 'error', '-nostats',
            '-f', 'avfoundation',
            '-r', '30',
            '-i', '0', // Replace '0' with your webcam device index if different
            '-c:v', 'libx265',      // Encode using H.264
            '-an',
            '-preset', 'ultrafast', // Set encoding speed/quality
            '-tune', 'zerolatency', // Tune for low-latency streaming
            '-f', 'mpegts', // Output format
            // Output to stdout
            '-'
        ], {
            stdio: ['inherit', 'pipe', 'inherit']
        });

        this.stream.stdout?.pipe(this.streamPipe);
    }

    async onModuleInit() {
        console.log('MediaModule')
        // this.startMediaStream();
        this.createMediaServer();
        // this.startMjpegStream();
    }
}
