// import { useEvents } from 'src/client/hooks';
import { ViewProps } from 'src/client/user-interface';
import { type MediaModule } from '../view';
import { cn } from 'src/client/utility';
import { useEffect, useRef } from 'react';
import mpegts from 'mpegts.js';

export const MediaContextItem: React.FC<ViewProps<MediaModule>> = ({
    module,
}) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
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
    }, []);
    return (
        <video
            ref={videoRef}
            src="http://localhost:16600/"
            controls={false}
            autoPlay
            muted
            className="absolute inset-0 object-cover object-center w-full h-full"
        ></video>
    );
};
