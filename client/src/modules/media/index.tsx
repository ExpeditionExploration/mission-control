import React, { useEffect, useRef, useState } from "react"
import type Module from "../Module";
import clsx from "clsx";

import DecodeWorker from './worker?worker';

// @ts-ignore
import YUVBuffer from "yuv-buffer";

// @ts-ignore
import YUVCanvas from 'yuv-canvas';

const format = YUVBuffer.format({
    // Many video formats require an 8- or 16-pixel block size.
    width: 1280,//1920,
    height: 720,//1088,

    // Using common 4:2:0 layout, chroma planes are halved in each dimension.
    chromaWidth: 1280 / 2,//1920 / 2,
    chromaHeight: 720 / 2,//1088 / 2,

    // Crop out a 1920x1080 visible region:
    cropLeft: 0,
    cropTop: 0,
    cropWidth: 1280,//1920,
    cropHeight: 720,//1080,

    // Square pixels, so same as the crop size.
    displayWidth: 1280,//1920,
    displayHeight: 720,//1080
});
const host = false ? 'ws://localhost:16502' : 'ws://raspberrypi.local:16502';

export const Media: Module = {
    // controller: () => {
    //     // Setup and request video stream.
    // },
    window: ({
        events,
        send,
        debug
    }) => {
        const videoSteamSocket = useRef<WebSocket>();
        const decodeWorker = useRef<Worker>();
        const yuv = useRef<any>(null);
        const canvas = useRef<HTMLCanvasElement>(null);

        function connectVideoStream() {
            if (!videoSteamSocket.current || videoSteamSocket.current?.readyState == WebSocket.CLOSED) {
                if (decodeWorker.current) decodeWorker.current.terminate();

                const socket = new WebSocket(host);
                const worker = new DecodeWorker();

                socket.binaryType = "arraybuffer";
                socket.onmessage = (event) => {
                    const data = new Uint8Array(event.data);
                    worker.postMessage(data.buffer, [data.buffer])
                }

                worker.onmessage = (event) => {
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
                        yuv.current.drawFrame(frame);
                    } catch (error) { }
                }
                socket.onopen = (event) => {
                    debug('Media stream connected');
                };

                socket.onclose = (event) => {
                    debug('Media stream closed, retrying in 1s');
                    setTimeout(() => connectVideoStream(), 1000);
                };

                debug('Setting stream socket', socket);
                videoSteamSocket.current = socket;

                debug('Setting decoder', worker);
                decodeWorker.current = worker;
            }
        }

        useEffect(() => {
            /**
             * Setup yuv canvas to link to canvas
             */
            debug('Setting up canvas');
            yuv.current = YUVCanvas.attach(canvas.current);
        }, [canvas.current]);

        useEffect(() => {
            // const canvas = document.getElementById('canvas') as HTMLCanvasElement;
            connectVideoStream();
            return () => {
                debug('Cleaning up');
                if (videoSteamSocket.current) {
                    debug('Cleaning up socket', videoSteamSocket.current);
                    videoSteamSocket.current.onclose = null;
                    videoSteamSocket.current.onopen = null;
                    videoSteamSocket.current.onmessage = null;
                    videoSteamSocket.current.close();
                    videoSteamSocket.current = undefined;
                }
                if (decodeWorker.current) {
                    debug('Cleaning up decoder', decodeWorker.current);
                    decodeWorker.current.terminate();
                    decodeWorker.current = undefined;
                }
            }
        }, []);

        return (
            <div id="viewer" className='fixed z-0 flex justify-center items-stretch inset-0'>
                <canvas ref={canvas} id="canvas" width="1920" height="1080"></canvas>
            </div>
        )
    }
}