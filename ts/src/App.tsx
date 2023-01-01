import { useEffect, useState } from 'react'
import './App.css';
import logo from './assets/exs.svg';
import {
    LightBulbIcon
} from '@heroicons/react/24/outline';

function App() {
    const [count, setCount] = useState(0);
    const [socket, setSocket] = useState(0);

    function toggleStream() {
        if (socket) {
            socket.close();
            setSocket();
        } else {
            var playerElement = document.getElementById('viewer');
            playerElement.innerHTML = '';

            const player = new window.Player({
                useWorker: true,
                workerFile: '/broadway/Decoder.js',
                webgl: 'auto',
                // size: { width: 1920, height: 1080 }
            });

            playerElement.appendChild(player.canvas);

            const socket = new WebSocket('ws://raspberrypi.local:16501');
            socket.binaryType = "arraybuffer";
            socket.addEventListener('open', (event) => {
                setSocket(socket);
            });
            // Listen for messages
            socket.addEventListener('message', (event) => {
                player.decode(new Uint8Array(event.data));
                // console.log('Message', event.data);
            });
        }
    }

    return (
        <>
            <div id="viewer" className='fixed z-0 flex justify-center items-stretch inset-0'></div>
            <div className='z-10 absolute inset-0'>
                <div className='absolute top-0 w-full p-8'>
                </div>
                <div className='absolute bottom-0 w-full px-8 pb-4 pt-8 flex justify-between items-top  bg-gradient-to-t from-black/50 to-transparent'>
                    <div className='flex items-center space-x-8'>
                        <img src={logo} className='h-12' />
                        <div className='space-y-2'>
                            <div className='h-16 flex justify-center items-center'>
                                <div className='h-8 w-16 relative border-2 border-white rounded-lg'>
                                    <div className='absolute left-8 right-0 top-1/2 mt-[-1px] border-t-[2px] border-white'></div>
                                </div>
                            </div>
                            <div className='text-xs'>Pitch</div>
                        </div>
                        <div className='space-y-2'>
                            <div className='h-16 flex justify-center items-center'>
                                <div className='h-8 w-8 relative border-2 border-white rounded-full'>
                                    <div className='absolute bottom-4 top-0 left-1/2 ml-[-1px] border-r-[2px] border-white'></div>
                                </div>
                            </div>
                            <div className='text-xs'>Roll</div>
                        </div>
                        <div className='space-y-2'>
                            <div className='h-16 flex justify-center items-center'>
                                <LightBulbIcon className='h-8 text-yellow-200' />
                            </div>
                            <div className='text-xs'>Lights</div>
                        </div>
                    </div>
                    <div className='flex items-center'>
                        <button onClick={() => toggleStream()}>Start Stream</button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default App
