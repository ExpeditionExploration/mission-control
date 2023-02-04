import React, { useEffect } from "react"
import type Module from "../Module";
import clsx from "clsx";

import DecodeWorker from './worker?worker';

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

const Media: Module = {
    // controller: () => {
    //     // Setup and request video stream.
    // },
    window: ({
        events,
        send
    }) => {
        useEffect(() => {
            const encoderWorker = new DecodeWorker();
            const videoSteamSocket = new WebSocket('ws://raspberrypi.local:16502');

            const canvas = document.getElementById('canvas') as HTMLCanvasElement;
            const yuv = YUVCanvas.attach(canvas);

            videoSteamSocket.binaryType = "arraybuffer";
            videoSteamSocket.onmessage = (event) => {
                const data = new Uint8Array(event.data);
                encoderWorker.postMessage(data.buffer, [data.buffer])
                // console.log(event.data);

            }

            encoderWorker.onmessage = (event) => {
                const data = new Uint8Array(event.data);
                try {
                    const y = YUVBuffer.lumaPlane(format, data);
                    const u = YUVBuffer.chromaPlane(format, data, undefined, format.width * format.height);
                    const v = YUVBuffer.chromaPlane(format, data, undefined, format.width * format.height + format.chromaWidth * format.chromaHeight);

                    const frame = YUVBuffer.frame(format,
                        y,
                        u,
                        v
                    );
                    yuv.drawFrame(frame);
                } catch (error) { }
            }

            return () => {
                encoderWorker.terminate();
                videoSteamSocket.close();
            }
        }, []);

        return (
            <div id="viewer" className='fixed z-0 flex justify-center items-stretch inset-0'>
                <canvas id="canvas" width="1920" height="1080"></canvas>
            </div>
        )
    }
}