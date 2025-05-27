// import { useEvents } from 'src/client/hooks';
import { ViewProps } from 'src/client/user-interface';
import { type MediaModuleClient } from '../client';
import { useEffect, useRef } from 'react';
import GstWebRTCAPI, { type Producer } from 'gstwebrtc-api';

export const MediaContextItem: React.FC<ViewProps<MediaModuleClient>> = ({
    module,
}) => {
    console.log('MediaContextItem rendered');
    const videoRef = useRef<HTMLVideoElement>(null);
    const webrtcStreamInitialised = useRef<boolean>(false);

    function connectVideoStream() {
        if (webrtcStreamInitialised.current) return; // Already connected
        webrtcStreamInitialised.current = true;

        const signalingProtocol = window.location.protocol.startsWith('https')
            ? 'wss'
            : 'ws';
        const gstWebRTCConfig = {
            meta: { name: `Client-${Date.now()}` },
            signalingServerUrl: `${signalingProtocol}://${window.location.hostname}:8443`,
            reconnectionTimeout: 5000,
            webrtcConfig: {},
        };
        const api = new GstWebRTCAPI(gstWebRTCConfig);

        const listener = {
            producerAdded: function (producer: Producer) {
                const session = api.createConsumerSession(producer.id);
                session.mungeStereoHack = true; // Copied from the original code, not sure what it does

                session.addEventListener('error', (event) => {
                    module.logger.error('Consumer session error:', event);
                });

                session.addEventListener('closed', () => {
                    module.logger.info('Consumer session closed');

                    videoRef.current!.pause();
                    videoRef.current!.srcObject = null;
                });

                session.addEventListener('streamsChanged', () => {
                    const streams = session.streams;
                    if (streams.length > 0) {
                        videoRef.current!.srcObject = streams[0];
                        // videoRef.current!.play();
                    }
                });

                session.connect();
            },
            producerRemoved: function (producer: Producer) {
                console.log('Producer removed:', producer);
            },
        };
        api.registerProducersListener(listener);
        for (const producer of api.getAvailableProducers()) {
            listener.producerAdded(producer);
        }
    }

    useEffect(() => {
        console.log('MediaContextItem useEffect called');
        // const canvas = document.getElementById('canvas') as HTMLCanvasElement;
        connectVideoStream();
        // return () => {
        //     console.log('Cleaning up');
        //     if (videoRef.current) {
        //         console.debug('Cleaning up video element', videoRef.current);
        //         videoRef.current.srcObject = null;
        //     }
        // };
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
                autoPlay
                muted
                ref={videoRef}
                className="relative z-10 object-cover object-center w-full h-full"
            ></video>
        </div>
    );
};
