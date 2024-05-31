import { Module } from 'src/module';
import { Side, UserInterface } from 'src/client/user-interface';
import { ClientModuleDependencies } from 'src/client/client';
import { MediaContextItem } from './components/MediaContextItem';
import { TakePictureButton } from './components/TakePictureButton';
import { RecordButton } from './components/RecordButton';

export class MediaModuleView extends Module {
    userInterface: UserInterface;

    constructor(deps: ClientModuleDependencies) {
        super(deps);
        this.userInterface = deps.userInterface;
    }

    listenToMediaStream() {
        // const mediaSource = new MediaSource();
        // video.src = URL.createObjectURL(mediaSource);
        // video!.addEventListener('error', (e) => {
        //     console.error('Video Error:', e);
        // });
        // mediaSource.addEventListener('error', (e) => {
        //     console.error('MediaSource Error:', e);
        // });
        // let sourceBuffer: any;
        // function appendBuffer(data: any) {
        //     if (sourceBuffer && mediaSource.readyState === 'open') {
        //         sourceBuffer.appendBuffer(new Uint8Array(data));
        //     }
        // }
        // mediaSource.addEventListener('sourceopen', () => {
        //     console.log('Media source is open');
        //     sourceBuffer = mediaSource.addSourceBuffer(
        //         'video/webm; codecs="vp09.00.10.08"',
        //     );
        //     const ws = new WebSocket('ws://localhost:16600');
        //     ws.binaryType = 'arraybuffer';
        //     ws.onopen = () => {
        //         console.log('Connected to media stream');
        //     };
        //     ws.onmessage = (event) => {
        //         if (sourceBuffer && !sourceBuffer.updating) {
        //             appendBuffer(event.data);
        //         }
        //     };
        // });
    }

    onModuleInit(): void | Promise<void> {
        this.userInterface.addContextItem(MediaContextItem);
        this.userInterface.addFooterItem(TakePictureButton, Side.Right);
        this.userInterface.addFooterItem(RecordButton, Side.Right);
        // setTimeout(() => {
        //     this.listenToMediaStream();
        // }, 1000);
    }
}
