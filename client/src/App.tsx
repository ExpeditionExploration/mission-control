import { useEffect, useState, FunctionComponent, useRef } from 'react'
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
import logger from 'debug';

const host = false ? 'ws://localhost:16501' : 'ws://raspberrypi.local:16501';

type SocketPayload = {
    module: string;
    event: string;
    data: any;
}

function App() {
    const debug = logger('MissionControl:App');
    const appSocket = useRef<WebSocket>();
    const events = useRef(new EventEmitter());

    const [menuOpen, setMenuOpen] = useState(false);

    function send(module: string, event: string = '', data: any) {
        if (appSocket.current?.readyState == WebSocket.OPEN) {
            const payload: SocketPayload = { module, data, event };
            appSocket.current.send(JSON.stringify(payload));
        }
    }

    function loadModules(type: keyof Module) {
        return Object.entries(modules)
            .filter(([name, module]) => !!module[type])
            .map(([name, module]) => {
                const Controller = module[type] as Controller;
                return <Controller
                    key={name}
                    debug={logger(`MissionControl:Module:${name}`)}
                    events={events.current}
                    send={(data: any, event?: string) => send(name, event, data)}
                />;
            })
    }

    function connectSocket() {
        debug('Connecting application socket');
        if (!appSocket.current || appSocket.current?.readyState == WebSocket.CLOSED) {
            debug('Creating application socket');

            const socket = new WebSocket(host);
            socket.onopen = (event) => {
                debug('Application socket connected');
            };
            socket.onmessage = (event) => {
                const payload: SocketPayload = JSON.parse(event.data) as any;
                events.current.emit(`Module:${payload.module}${payload.event ? `:${payload.event}` : ''}`, payload.data);
            };
            socket.onclose = (event) => {
                debug('Application socket closed, retrying in 1s');
                setTimeout(() => connectSocket(), 1000);
            };

            appSocket.current = socket;
        }
    }


    useEffect(() => {
        debug('Setup app');
        connectSocket();
        return () => {
            debug('Cleanup app');
            if (appSocket.current) {
                appSocket.current.onclose = null;
                appSocket.current.onopen = null;
                appSocket.current.onmessage = null;
                appSocket.current.close();
                appSocket.current = undefined;
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
