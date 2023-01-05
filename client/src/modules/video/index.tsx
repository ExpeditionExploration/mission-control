import React, { useEffect } from "react"
import Module, { ModuleLocation } from "../ClientModule";
import clsx from "clsx";

import DecodeWorker from './worker?worker'
const worker = new DecodeWorker();

// @ts-ignore
import YUVBuffer from "yuv-buffer";

// @ts-ignore
import YUVCanvas from 'yuv-canvas';
const format = YUVBuffer.format({
    // Many video formats require an 8- or 16-pixel block size.
    width: 1920,
    height: 1088,

    // Using common 4:2:0 layout, chroma planes are halved in each dimension.
    chromaWidth: 1920 / 2,
    chromaHeight: 1088 / 2,

    // Crop out a 1920x1080 visible region:
    cropLeft: 0,
    cropTop: 0,
    cropWidth: 1920,
    cropHeight: 1080,

    // Square pixels, so same as the crop size.
    displayWidth: 1920,
    displayHeight: 1080
});
export class Video extends Module {
    static location: ModuleLocation = "window";
    socket: WebSocket | null = null;

    componentDidMount() {
        const canvas = document.getElementById('canvas') as HTMLCanvasElement;
        const yuv = YUVCanvas.attach(canvas);

        this.socket = new WebSocket('ws://raspberrypi.local:16502');
        this.socket.binaryType = "arraybuffer";
        this.socket.onmessage = (event) => {
            const data = new Uint8Array(event.data);
            worker.postMessage(data.buffer, [data.buffer])
            // console.log(event.data);

        }

        worker.onmessage = (event) => {
            const data = new Uint8Array(event.data);
            const y = YUVBuffer.lumaPlane(format, data);
            const u = YUVBuffer.chromaPlane(format, data, undefined, format.width * format.height);
            const v = YUVBuffer.chromaPlane(format, data, undefined, format.width * format.height + format.chromaWidth * format.chromaHeight);

            const frame = YUVBuffer.frame(format,
                y,
                u,
                v
            );
            yuv.drawFrame(frame);
        }
        // this.socket = new WebSocket('ws://raspberrypi.local:16502');
        // this.socket.binaryType = "arraybuffer";
        // this.socket.onmessage = (event) => {
        //     // console.log(event.data);
        //     // decoder.decode(new Uint8Array(event.data));
        // }
        // const playerElement = document.getElementById('viewer');

        // if (playerElement) {
        //     playerElement.innerHTML = '';

        //     // @ts-ignore
        //     const Player = window.Player as any;
        //     const player = new Player({
        //         useWorker: true,
        //         workerFile: '/broadway/Decoder.js',
        //         webgl: 'auto',
        //         size: { width: 1920, height: 1080 }
        //     });

        //     playerElement.appendChild(player.canvas);

        //     this.socket.onmessage = (event) => {
        //         // console.log(event.data);
        //         player.decode(new Uint8Array(event.data));
        //     }
        // }
    }


    // function toggleStream() {
    //     if (socket) {
    //         socket.close();
    //         setSocket(null);
    //     } else {
    //         var playerElement = document.getElementById('viewer');
    //         if (playerElement) {
    //             playerElement.innerHTML = '';

    //             // @ts-ignore
    //             const Player = window.Player as any;
    //             const player = new Player({
    //                 useWorker: true,
    //                 workerFile: '/broadway/Decoder.js',
    //                 webgl: 'auto',
    //                 // size: { width: 1920, height: 1080 }
    //             });

    //             playerElement.appendChild(player.canvas);

    //             // Listen for messages
    //             socket.addEventListener('message', (event) => {
    //                 player.decode(new Uint8Array(event.data));
    //                 // console.log('Message', event.data);
    //             });
    //         }
    //     }
    // }


    render() {
        return (
            <div id="viewer" className='fixed z-0 flex justify-center items-stretch inset-0'>
                <canvas id="canvas" width="1280" height="720"></canvas>
            </div>
        )
    }
}
