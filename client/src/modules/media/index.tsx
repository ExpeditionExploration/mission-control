import React, { useEffect, useRef, useState } from "react"
import type Module from "../Module";
import clsx from "clsx";

const host = `ws://${window.location.hostname}:16502`;

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
        const canvasRef = useRef<HTMLCanvasElement>(null);

        function connectVideoStream() {
            if (!videoSteamSocket.current || videoSteamSocket.current?.readyState == WebSocket.CLOSED) {
                const socket = new WebSocket(host);

                const canvas = canvasRef.current;
                const ctx = canvas.current?.getContext('2d');
                const img = new Image();
                img.onload = function () {
                    let loadedImageWidth = img.width;
                    let loadedImageHeight = img.height;
                    // get the scale
                    // it is the min of the 2 ratios
                    let scale_factor = Math.min(canvas.width / img.width, canvas.height / img.height);

                    // Lets get the new width and height based on the scale factor
                    let newWidth = img.width * scale_factor;
                    let newHeight = img.height * scale_factor;

                    // get the top left position of the image
                    // in order to center the image within the canvas
                    let x = (canvas.width / 2) - (newWidth / 2);
                    let y = (canvas.height / 2) - (newHeight / 2);

                    // When drawing the image, we have to scale down the image
                    // width and height in order to fit within the canvas
                    ctx.drawImage(img, x, y, newWidth, newHeight);
                    ctx?.drawImage(img, 0, 0);
                };

                socket.binaryType = "arraybuffer";
                socket.onmessage = (event) => {
                    var blob = new Blob([event.data], { type: 'image/jpeg' });
                    img.src = URL.createObjectURL(blob);
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
            }
        }

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
            }
        }, []);

        return (
            <div id="viewer" className='fixed z-0 flex justify-center items-stretch inset-0'>
                <canvas ref={canvasRef} id="canvas" width="1920" height="1080"></canvas>
            </div>
        )
    }
}