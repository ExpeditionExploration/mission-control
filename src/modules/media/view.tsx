import { Module } from 'src/module';
import { UserInterface } from 'src/client/user-interface';
import { ClientModuleDependencies } from 'src/client/client';
import { MediaContextItem } from './components/MediaContextItem';

export class MediaModule extends Module {
    userInterface: UserInterface;

    constructor(deps: ClientModuleDependencies) {
        super(deps);
        this.userInterface = deps.userInterface;
    }

    listenToMediaStream() {
        const video: any = document.getElementById('video');
        const mediaSource = new MediaSource();
        video.src = URL.createObjectURL(mediaSource);

        video!.addEventListener('error', (e) => {
            console.error('Video Error:', e);
        });

        mediaSource.addEventListener('error', (e) => {
            console.error('MediaSource Error:', e);
        });
        let sourceBuffer: any;

        function appendBuffer(data: any) {
            if (sourceBuffer && mediaSource.readyState === 'open') {
                sourceBuffer.appendBuffer(new Uint8Array(data));
            }
        }

        mediaSource.addEventListener('sourceopen', () => {
            console.log('Media source is open');

            sourceBuffer = mediaSource.addSourceBuffer(
                'video/webm; codecs="vp09.00.10.08"',
            );
            const ws = new WebSocket('ws://localhost:16600');
            ws.binaryType = 'arraybuffer';
            ws.onopen = () => {
                console.log('Connected to media stream');
            };
            ws.onmessage = (event) => {
                if (sourceBuffer && !sourceBuffer.updating) {
                    appendBuffer(event.data);
                }
            };
        });
    }

    onModuleInit(): void | Promise<void> {
        this.userInterface.addContextItem(MediaContextItem);
        setTimeout(() => {
            this.listenToMediaStream();
        }, 1000);
    }
}
