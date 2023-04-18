import { useEffect, useState, FunctionComponent } from "react"
import { Location, type Module } from "../../types";
import clsx from "clsx";
import { ArrowsPointingInIcon, ArrowsPointingOutIcon } from "@heroicons/react/24/outline";

export const Fullscreen: Module = () => {
    const [fullScreen, setFullscreen] = useState(false);

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
    }, []);

    return <div className='cursor-pointer' onClick={() => toggleFullScreen()}>
        {fullScreen ? <ArrowsPointingInIcon className='h-6' /> : <ArrowsPointingOutIcon className='h-6' />}
    </div>
}
Fullscreen.location = Location.Header;