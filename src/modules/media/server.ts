import { Module } from 'src/module';
import { ChildProcess, spawn } from 'child_process';
import { randomBytes } from 'crypto';
import { readFile } from 'fs/promises';

export class MediaModuleServer extends Module {
    private gstreamer!: ChildProcess;

    async onModuleInit() {
        this.logger.info('Starting media server');
        this.createMediaServer();
        this.on('takePicture', () => {
            this.logger.info('Take picture command received');
            this.takePicture();
        });
        this.on('startRecording', () => {
            this.logger.info('Start recording command received');
            // Here you would implement the logic to start recording
            // For example, you could use GStreamer to start a video stream
        });
    }

    private getVideoSource(): string[] {
        const mocked = (this.config as any)?.modules?.media?.server?.mocked;
        this.logger.info('Media module mocked mode:', mocked);
        if (mocked) {
            return [
                'videotestsrc', 'is-live=true', 'pattern=ball',
                '!' , 'video/x-raw,format=I420,width=1280,height=720,framerate=30/1',
            ];
        }

        const src = process.platform === 'darwin'
            ? 'avfvideosrc device-index=0'
            : process.platform === 'win32'
            ? 'ksvideosrc device-index=0'
            : 'v4l2src device-index=0';
        const asrc = src.split(' ');
        asrc.push(
            // Better to keep video in GL memory for performance since
            // we will also be using Gstreamer to capture video.
            // According to AI, it can prevent unnecessary CPU overhead
            // by creating multiple copies of the video frame.
            'video/x-raw(memory:GLMemory)',
            '!',
            // Add any GL processing elements here if needed
            'gldownload',
            '!',
        );
        return asrc
    }

    takePicture(): void {
        this.logger.info('Taking picture...');
        const tempImageName = `/tmp/frame-${randomBytes(8).toString(
            'hex',
        )}.png`;
        const gstArgs = [
            '-v',
            ...this.getVideoSource(),
            'num-buffers=1',
            '!',
            'video/x-raw(memory:GLMemory)',
            '!',
            // Add any GL processing elements here if needed
            'glcolorconvert',
            '!',
            'gldownload',
            '!',
            'pngenc',
            '!',
            // Make queue drop older frames for real-time performance
            'filesink',
            `location=${tempImageName}`,
        ];

        this.gstreamer = spawn('gst-launch-1.0', gstArgs, { stdio: 'pipe' });
        this.logger.info(
            'GStreamer process started with args:',
            gstArgs.join(' '),
        );
        this.gstreamer.stdout.on('data', (data: Buffer) => {
            this.logger.info(`GStreamer stdout: ${data.toString()}`);
        });
        this.gstreamer.stderr.on('data', (data: Buffer) => {
            this.logger.error(`GStreamer stderr: ${data.toString()}`);
        });
        this.gstreamer.on('close', async (code: number) => {
            this.logger.info(`GStreamer process exited with code ${code}`);
            const fileBuffer = await readFile(tempImageName);
            this.emit('pictureTaken', {
                data: fileBuffer.toString('base64'),
            });
        });
        this.gstreamer.on('error', (err: Error) => {
            this.logger.error('Failed to start GStreamer process:', err);
        });
    }

    createMediaServer(): void {
        console.log('Starting media server with GStreamer');
        // gst-launch-1.0 -v avfvideosrc device-index=0 ! videoconvert ! vtenc_h264 realtime=true ! queue max-size-buffers=1 leaky=downstream ! webrtcsink run-signalling-server=true video-caps="video/x-h264"
        const mocked = (this.config as any)?.modules?.media?.server?.mocked;
        const h264Path = [
            ...(mocked ? ['videoconvert', '!'] : []),
            'x264enc','tune=zerolatency','speed-preset=ultrafast','key-int-max=30','byte-stream=false','!',
            'h264parse','config-interval=-1','!',
            'video/x-h264,stream-format=avc,alignment=au','!',
            'webrtcsink', 'video-caps=video/x-h264'
        ];

        const h264Encoder =
            process.platform === 'darwin'
                ? // For macOS, use vtenc_h264 encoder
                  ['vtenc_h264', 'realtime=true']
                : // For Windows and Linux, use x264 encoder
                  [
                    ...(mocked ? ['videoconvert', '!'] : []),
                    'x264enc','tune=zerolatency','speed-preset=ultrafast','key-int-max=30','byte-stream=false','!',
                    'h264parse','config-interval=-1','!',
                    'video/x-h264,stream-format=avc,alignment=au','!',
                    'webrtcsink', 'run-signalling-server=true', 'video-caps=video/x-h264'
                ];

        // Use device index 0 for the first camera
        this.logger.info('Using video source:', this.getVideoSource().join(' '));
        const gstArgs = [
            '-v',
            ...this.getVideoSource(),
            '!',
            // Convert video format to H264
            ...h264Encoder,
            //'!',
            // // Make queue drop older framers for real-time performance
            // 'queue',
            // 'max-size-buffers=1',
            // 'leaky=downstream',
            // '!',
            // // Sink to WebRTC
            // 'webrtcsink',
            // 'run-signalling-server=true',
            // 'video-caps=video/x-h264',
        ];

        this.gstreamer = spawn('gst-launch-1.0', gstArgs, { stdio: 'pipe' });
        this.logger.info(
            'GStreamer process started with args:',
            gstArgs.join(' '),
        );
        this.gstreamer.stdout.on('data', (data: Buffer) => {
            this.logger.info(`GStreamer stdout: ${data.toString()}`);
        });
        this.gstreamer.stderr.on('data', (data: Buffer) => {
            this.logger.error(`GStreamer stderr: ${data.toString()}`);
        });
        this.gstreamer.on('close', (code: number) => {
            this.logger.info(`GStreamer process exited with code ${code}`);
        });
        this.gstreamer.on('error', (err: Error) => {
            this.logger.error('Failed to start GStreamer process:', err);
        });
    }
}
