import { useEffect, useState, FunctionComponent } from 'react'
import logo from './assets/exs.svg';
import {
    LightBulbIcon,
    Bars3Icon,
    ArrowsPointingOutIcon,
    ArrowsPointingInIcon,
} from '@heroicons/react/24/outline';

import type { Module, Controller } from './modules/Module';
import * as modules from './modules';
import { EventEmitter } from 'events';

const host = import.meta.env.DEV ? 'ws://localhost:16501' : 'ws://raspberrypi.local:16501';

type SocketPayload = {
    module: string;
    data: any;
}

function App() {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [events] = useState(new EventEmitter());

    const [menuOpen, setMenuOpen] = useState(false);

    function send(module: string, data: any) {
        if (socket?.readyState == WebSocket.OPEN) {
            const payload: SocketPayload = { module, data };
            socket.send(JSON.stringify(payload));
        }
    }

    function loadModules(type: keyof Module) {
        return Object.entries(modules)
            .filter(([name, module]) => !!module[type])
            .map(([name, module]) => {
                const Controller = module[type] as Controller;
                return <Controller
                    key={name}
                    events={events}
                    send={(data: any) => send(name, data)}
                />;
            })
    }

    function connectSocket() {
        if (!socket || socket?.readyState == WebSocket.CLOSED) {
            const socket = new WebSocket(host);
            socket.onopen = (event) => {
                console.log('Open')
            };
            socket.onmessage = (event) => {
                const payload: SocketPayload = JSON.parse(event.data) as any;
                events.emit(`module:${payload.module}`, payload.data);
            };
            socket.onclose = (event) => {
                console.log('Closed, retry in 1s');
                setTimeout(() => connectSocket(), 1000);
            };

            setSocket(socket);
        }
    }

    useEffect(() => {
        connectSocket();
        return () => {
            if (socket) {
                socket.onclose = null;
                socket.onopen = null;
                socket.onmessage = null;
                socket.close();
            }
        }
    }, []);

    return (
        <>
            {loadModules('window')}
            <div className='z-10 absolute inset-0'>
                <div className='bg-gradient-to-b space-x-8 p-8 pt-4 from-black/50 to-transparent absolute top-0 flex items-center justify-between w-full'>
                    <div className='w-full text-left flex items-center space-x-8'>
                        {loadModules('header')}
                    </div>
                    <div>
                        <Bars3Icon className='h-8 cursor-pointer' />
                    </div>
                </div>
                <div className='absolute bottom-0 w-full px-12 pb-4 pt-8  bg-gradient-to-t from-black/50 to-transparent'>
                    <div className='h-24 flex justify-between items-bottom '>
                        <div className='flex items-center space-x-8 w-full'>
                            <img src={logo} className='h-12' />
                            {loadModules('left')}
                        </div>
                        <div className='flex items-center  space-x-8'>
                            {loadModules('right')}
                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}

export default App
