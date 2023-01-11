import { useEffect, useState, FunctionComponent } from 'react'
import './App.css';
import logo from './assets/exs.svg';
import {
    LightBulbIcon,
    Bars3Icon,
    ArrowsPointingOutIcon,
    ArrowsPointingInIcon,
} from '@heroicons/react/24/outline';

import type { ClientModule, ModuleLocation } from './modules/ClientModule';
import * as modules from './modules';
import { EventEmitter } from 'events';

const host = 'raspberrypi.local:16501';


function App() {
    const [socket, setSocket] = useState(new WebSocket(`ws://${host}`));
    const [events, setEvents] = useState(new EventEmitter());
    const [fullScreen, setFullscreen] = useState(false);

    const [menuOpen, setMenuOpen] = useState(false);

    function send(module: string, data: any) {
        console.log(module, data);
    }

    function loadModules(location: ModuleLocation) {
        return Object.values(modules).map((Module: ClientModule) => Module.location === location ?
            <Module
                key={Module.name}
                events={events}
                send={(data: any) => send(Module.id, data)}
            /> : null)
    }

    function toggleFullScreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }

    useEffect(() => {
        window.addEventListener('fullscreenchange', (event: any) => { 
            setFullscreen(!!document.fullscreenElement);
        });
        // socket.binaryType = "arraybuffer";
        socket.addEventListener('open', (event) => {
            console.log('Listening')
        });
        socket.addEventListener('message', (event) => {
            const data = JSON.parse(event.data);
            events.emit(`module:${data.module}`, data.data);
        });
    }, []);


    return (
        <>
            {loadModules('window')}
            <div className='z-10 absolute inset-0'>
                <div className='bg-gradient-to-b space-x-8 p-8 pt-4 from-black/50 to-transparent absolute top-0 flex items-center justify-between w-full'>
                    <div className='cursor-pointer' onClick={() => toggleFullScreen()}>
                        {fullScreen ? <ArrowsPointingInIcon className='h-6' /> : <ArrowsPointingOutIcon className='h-6' />}
                    </div>
                    <div className='w-full text-left'>{loadModules('header')}</div>
                    <div>
                        <Bars3Icon className='h-8 cursor-pointer' />
                    </div>
                </div>
                <div className='absolute bottom-0 w-full px-12 pb-4 pt-8  bg-gradient-to-t from-black/50 to-transparent'>
                    <div className='h-24 flex justify-between items-bottom '>
                        <div className='flex items-center space-x-8 w-full'>
                            <img src={logo} className='h-12' />

                            {loadModules('left')}
                            <div className='space-y-2'>
                                <div className='h-16 flex justify-center items-center'>
                                    <LightBulbIcon className='h-8 text-yellow-200' />
                                </div>
                                <div className='text-xs'>Lights</div>
                            </div>
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
