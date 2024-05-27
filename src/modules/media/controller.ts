import { Module } from 'src/module';
import { execSync, spawn } from 'child_process';
import { WebSocketServer } from 'ws';
import fs from 'fs';
import { createServer, IncomingMessage, ServerResponse } from 'http';

const FIFO_PATH = '/tmp/video_fifo_asdasas';
function createFIFO(fifoPath: string) {
    if (fs.existsSync(fifoPath)) {
        fs.unlinkSync(FIFO_PATH);
    }

    execSync(`mkfifo ${fifoPath}`);
}


export class MediaModule extends Module {
    private wss!: WebSocketServer;
    createMediaServer(): void {
        createServer((req, res) => {
            this.startMediaStream(req, res);
        }).listen(16600, () => {
            console.log('Media server is running on http://localhost:16600');
        });
    }
    startMediaStream(req: IncomingMessage, res: ServerResponse<IncomingMessage>): void {
        console.log('Starting media stream')
        // fs.unlinkSync(FIFO_PATH);
        // createFIFO(FIFO_PATH);

        const stream = spawn('ffmpeg', [
            '-f', 'avfoundation',
            '-framerate', '30',
            '-i', '0', // Replace '0' with your webcam device index if different
            '-c:v', 'libvpx-vp9',      // Encode using H.264
            // 'c:a', 'na',           // Encode using AAC
            '-b:v', '1M',           // Set video bitrate
            '-keyint_min', '30',    // Set minimum interval between keyframes
            '-g', '30',             // Set GOP size (keyframe interval)
            '-deadline', 'realtime',// Set deadline for real-time encoding
            // '-preset', 'ultrafast', // Set encoding speed/quality
            // '-tune', 'zerolatency', // Tune for low-latency streaming
            '-f', 'webm', // Output format
            '-'         // Output to stdout
        ], {
            stdio: ['ignore', 'pipe', 'inherit']
        });

        // const fifoStream = fs.createReadStream(FIFO_PATH);
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Transfer-Encoding', 'chunked');
        res.setHeader('Connection', 'keep-alive');
        // fifoStream.pipe(res);
        stream.stdout.pipe(res);
        // req.on('close', () => {
        //     stream.kill();
        //     fs.unlinkSync(FIFO_PATH);
        // });
        // stream.stderr.on('data', (data) => {
        //     console.error(`ffmpeg error: ${data}`);
        // });
    }

    async onModuleInit() {
        console.log('MediaModule')
        this.createMediaServer();
        // this.startMjpegStream();
    }
}
