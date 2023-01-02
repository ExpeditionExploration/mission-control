import React, { useEffect } from "react"
import Module, { ModuleLocation } from "../ClientModule";
import clsx from "clsx";

export class Video extends Module {
    static location: ModuleLocation = "window";
    socket: WebSocket | null = null;
    
    componentDidMount() {
        this.socket = new WebSocket('ws://raspberrypi.local:16502');
        this.socket.binaryType = "arraybuffer";
        const playerElement = document.getElementById('viewer');

        if (playerElement) {
            playerElement.innerHTML = '';

            // @ts-ignore
            const Player = window.Player as any;
            const player = new Player({
                useWorker: true,
                workerFile: '/broadway/Decoder.js',
                webgl: 'auto',
                size: { width: 1920, height: 1080 }
            });

            playerElement.appendChild(player.canvas);

            this.socket.onmessage = (event) => {
                player.decode(new Uint8Array(event.data));
            }
        }
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
            <div id="viewer" className='fixed z-0 flex justify-center items-stretch inset-0'></div>
        )
    }
}
