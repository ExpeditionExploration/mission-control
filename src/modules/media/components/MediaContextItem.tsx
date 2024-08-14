// import { useEvents } from 'src/client/hooks';
import { ViewProps } from 'src/client/user-interface';
import { type MediaModuleView } from '../view';
import { useEffect, useRef } from 'react';
import mpegts from 'mpegts.js';

export const MediaContextItem: React.FC<ViewProps<MediaModuleView>> = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const playerRef = useRef<mpegts.Player | null>(null);
    useEffect(() => {
        console.log(videoRef.current);
        var player = mpegts.createPlayer({
            type: 'm2ts', // could also be mpegts, m2ts, flv
            isLive: true,
            url: 'ws://localhost:16600',
        });
        player.attachMediaElement(videoRef.current!);
        player.load();
        player.play();
        playerRef.current = player;
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
            <video
                ref={videoRef}
                src="http://localhost:16600/"
                controls={false}
                autoPlay
                muted
                className="relative z-10 object-cover object-center w-full h-full"
            ></video>
        </div>
    );
};
