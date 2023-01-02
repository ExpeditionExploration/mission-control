import { useEffect, useState } from 'react'
import './App.css';
import logo from './assets/exs.svg';
import {
    LightBulbIcon
} from '@heroicons/react/24/outline';
import type ClientModule from './modules/ClientModule';
import * as modules from './modules';

const host = 'localhost:16501';

function App() {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const socket = new WebSocket(`ws://${host}`);
        socket.binaryType = "arraybuffer";
        socket.addEventListener('open', (event) => {
            console.log('Listening')
            setSocket(socket);
        });
        socket.addEventListener('message', (event) => {
            console.log('Message', event.data);
        });
    }, []);

    return (
        <>
            {Object.values(modules).map((Module: typeof ClientModule) => Module.location === 'window' ? <Module key={Module.name} /> : null)}
            <div className='z-10 absolute inset-0'>
                <div className='absolute top-0 w-full p-8'>
                </div>
                <div className='absolute bottom-0 w-full px-12 pb-4 pt-8  bg-gradient-to-t from-black/50 to-transparent'>
                    <div className='h-24 flex justify-between items-bottom '>
                        <div className='flex items-center space-x-8 w-full'>
                            <img src={logo} className='h-12' />

                            {Object.values(modules).map((Module: typeof ClientModule) => Module.location === 'left' ? <Module key={Module.name} /> : null)}
                            <div className='space-y-2'>
                                <div className='h-16 flex justify-center items-center'>
                                    <LightBulbIcon className='h-8 text-yellow-200' />
                                </div>
                                <div className='text-xs'>Lights</div>
                            </div>
                        </div>
                        <div className='flex items-center  space-x-8'>
                            {Object.values(modules).map((Module: typeof ClientModule) => Module.location === 'right' ? <Module key={Module.name} /> : null)}
                            {/* <button onClick={() => toggleStream()}>Start Stream</button> */}
                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}

export default App
