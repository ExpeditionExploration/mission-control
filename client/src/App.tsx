import { useEffect, useState, FunctionComponent, useRef } from 'react'
import logo from './assets/exs.svg';
import {
    LightBulbIcon,
    Bars3Icon,
    ArrowsPointingOutIcon,
    ArrowsPointingInIcon,
} from '@heroicons/react/24/outline';

import { Location, LoadedControllers, SocketPayload } from './types';
import * as modules from './modules';
import { EventEmitter } from 'events';
import loadModules from './modules';
import { hostname } from './env';
import debug from 'debug';

const log = debug('MissionControl:App');
const events = new EventEmitter();

function App() {
    const appSocket = useRef<WebSocket>();

    const [menuOpen, setMenuOpen] = useState(false);
    const [loadedControllers, setLoadedControllers] = useState({
        [Location.Header]: [],
        [Location.BottomLeft]: [],
        [Location.BottomRight]: [],
        [Location.Menu]: [],
        [Location.Window]: [],
        [Location.Hidden]: []
    } as LoadedControllers);

    function send(event: string = '', data: any) {
        if (appSocket.current?.readyState == WebSocket.OPEN) {
            const payload: SocketPayload = { data, event };
            appSocket.current.send(JSON.stringify(payload));
        }
    }

    function connectSocket() {
        log('Connecting App socket');
        if (!appSocket.current || appSocket.current?.readyState == WebSocket.CLOSED) {
            log('Creating App socket');

            const socket = new WebSocket(`ws://${hostname}:16501`);
            socket.onopen = (event) => {
                log('App socket connected');
            };
            socket.onmessage = (event) => {
                const payload: SocketPayload = JSON.parse(event.data) as any;
                log('App socket message', payload);
                events.emit(payload.event, payload.data); // Emit any events that are specified
            };
            socket.onclose = (event) => {
                log('App socket closed, retrying in 1s');
                setTimeout(() => connectSocket(), 1000);
            };

            appSocket.current = socket;
        }
    }


    useEffect(() => {
        log('Setup app');
        connectSocket();
        setLoadedControllers(loadModules({ events, send }))

        return () => {
            log('Cleanup app');
            if (appSocket.current) {
                appSocket.current.onclose = null;
                appSocket.current.onopen = null;
                appSocket.current.onmessage = null;
                appSocket.current.close();
                appSocket.current = undefined;
            }
        }
    }, []);
    console.log(loadedControllers);
    return (
        <>
            <div className='!hidden absolute -z-10'>
                {loadedControllers[Location.Hidden]}
            </div>
            <div className='absolute inset-0 z-0 flex items-center justify-center w-full h-full'>
                {loadedControllers[Location.Window]}
            </div>
            <div className='z-10 absolute inset-0'>
                <div className='bg-gradient-to-b space-x-8 p-8 pt-4 from-black/50 to-transparent absolute top-0 flex items-center justify-between w-full'>
                    <div className='w-full text-left flex items-center space-x-8'>
                        {/* {loadModules('header')} */}
                        {loadedControllers[Location.Header]}
                    </div>
                    <div>
                        <Bars3Icon className='h-8 cursor-pointer' />
                    </div>
                </div>
                <div className='absolute bottom-0 w-full px-12 pb-4 pt-8  bg-gradient-to-t from-black/50 to-transparent'>
                    <div className='h-24 flex justify-between items-bottom '>
                        <div className='flex items-center space-x-8 w-full'>
                            <img src={logo} className='h-12' />
                            {/* {loadModules('left')} */}
                            {loadedControllers[Location.BottomLeft]}
                        </div>
                        <div className='flex items-center  space-x-8'>
                            {/* {loadModules('right')} */}
                            {loadedControllers[Location.BottomRight]}
                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}

export default App
