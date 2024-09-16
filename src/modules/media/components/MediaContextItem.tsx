// import { useEvents } from 'src/client/hooks';
import { ViewProps } from 'src/client/user-interface';
import { type MediaModuleClient } from '../client';
import { useEffect, useRef } from 'react';
// import mpegts from 'mpegts.js';

export const MediaContextItem: React.FC<ViewProps<MediaModuleClient>> = () => {
    const videoSteamSocket = useRef<WebSocket>();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    function connectVideoStream() {
        console.log('Connecting video stream');
        if (
            !videoSteamSocket.current ||
            videoSteamSocket.current?.readyState == WebSocket.CLOSED
        ) {
            const socket = new WebSocket(`ws://localhost:16600`);

            const canvas = canvasRef.current as HTMLCanvasElement;
            const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
            const img = new Image();
            img.onload = function () {
                let width = img.width;
                let height = img.height;

                canvas.width = width;
                canvas.height = height;

                // get the scale
                // it is the min of the 2 ratios
                let scale_factor = Math.min(
                    canvas.width / img.width,
                    canvas.height / img.height,
                );

                // Lets get the new width and height based on the scale factor
                let newWidth = img.width * scale_factor;
                let newHeight = img.height * scale_factor;

                // get the top left position of the image
                // in order to center the image within the canvas
                let x = canvas.width / 2 - newWidth / 2;
                let y = canvas.height / 2 - newHeight / 2;

                // When drawing the image, we have to scale down the image
                // width and height in order to fit within the canvas
                ctx.drawImage(img, x, y, newWidth, newHeight);
            };

            socket.binaryType = 'arraybuffer';
            socket.onmessage = (event) => {
                var blob = new Blob([event.data], { type: 'image/jpeg' });
                img.src = URL.createObjectURL(blob);
            };

            socket.onopen = (event) => {
                console.debug('Media stream connected');
            };

            socket.onclose = (event) => {
                console.debug('Media stream closed, retrying in 1s');
                setTimeout(() => connectVideoStream(), 1000);
            };

            console.debug('Setting stream socket', socket);
            videoSteamSocket.current = socket;
        }
    }

    useEffect(() => {
        // const canvas = document.getElementById('canvas') as HTMLCanvasElement;
        connectVideoStream();
        return () => {
            console.debug('Cleaning up');
            if (videoSteamSocket.current) {
                console.debug('Cleaning up socket', videoSteamSocket.current);
                videoSteamSocket.current.onclose = null;
                videoSteamSocket.current.onopen = null;
                videoSteamSocket.current.onmessage = null;
                videoSteamSocket.current.close();
                videoSteamSocket.current = undefined;
            }
        };
    }, []);

    return (
        <div className="absolute inset-0 w-full h-full">
            <div className="z-0 absolute w-full h-full">
                <div className="flex justify-center opacity-50 items-center w-full h-full">
                    <div className="text-white animate-pulse">
                        Waiting For Stream...
                    </div>
                </div>
            </div>
            <canvas
                ref={canvasRef}
                id="canvas"
                className="relative z-10 object-cover object-center w-full h-full"
            ></canvas>
        </div>
    );
};
