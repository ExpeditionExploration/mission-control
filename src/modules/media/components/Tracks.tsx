import {
    isTrackReference,
    TrackLoop,
    TrackRefContext,
    VideoTrack,
    useTracks,
    useRoomContext,
} from '@livekit/components-react';
import { Track, RemoteTrackPublication, RoomEvent } from 'livekit-client';
import { useEffect, useRef } from 'react';
import type { MediaModuleClient } from '../client';

type TracksProps = {
    module: MediaModuleClient;
};

export const Tracks = ({ module }: TracksProps) => {
    const room = useRoomContext();
    const tracks = useTracks(
        [{ source: Track.Source.Camera, withPlaceholder: true }],
        {
            onlySubscribed: false,
        },
    );
    const restartTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Enable local camera
    // useEffect(() => {
    //     const participant = room.localParticipant;

    //     const enableCamera = async () => {
    //         try {
    //             await participant.setCameraEnabled(true);
    //         } catch (error) {
    //             console.warn('Tracks: failed to enable local camera', error);
    //         }
    //     };

    //     if (room.state === 'connected') {
    //         void enableCamera();
    //     }

    //     const handleConnected = () => {
    //         void enableCamera();
    //     };

    //     room.on(RoomEvent.Connected, handleConnected);

    //     return () => {
    //         room.off(RoomEvent.Connected, handleConnected);
    //     };
    // }, [room]);

    // Automatically subscribe to drone tracks
    useEffect(() => {
        tracks.forEach((trackRef) => {
            if (!isTrackReference(trackRef)) {
                return;
            }

            const publication = trackRef.publication;
            if (!publication) {
                return;
            }

            if (trackRef.participant?.isLocal) {
                return;
            }

            if (!trackRef.participant?.identity.startsWith('drone-')) {
                return;
            }

            if (!('setSubscribed' in publication)) {
                return;
            }

            const remotePublication = publication as RemoteTrackPublication;
            if (remotePublication.isSubscribed) {
                return;
            }

            if (typeof remotePublication.setSubscribed === 'function') {
                remotePublication.setSubscribed(true);
            }
        });
    }, [tracks]);

    // Request test stream if no remote tracks are present
    useEffect(() => {
        if (restartTimerRef.current) {
            clearTimeout(restartTimerRef.current);
            restartTimerRef.current = null;
        }

        const hasRemoteTrack = tracks.some((trackRef) => {
            if (!isTrackReference(trackRef)) {
                return false;
            }
            return !trackRef.participant?.isLocal && Boolean(trackRef.publication?.videoTrack);
        });

        if (hasRemoteTrack) {
            return undefined;
        }

        restartTimerRef.current = setTimeout(() => {
            module.requestTestStreamStart(true);
            restartTimerRef.current = null;
        }, 5000);

        return () => {
            if (restartTimerRef.current) {
                clearTimeout(restartTimerRef.current);
                restartTimerRef.current = null;
            }
        };
    }, [tracks, module]);

    return (
        <TrackLoop tracks={tracks}>
            <TrackRefContext.Consumer>
                {(trackRef) => (
                    (isTrackReference(trackRef))
                    && (trackRef.participant.identity.startsWith('drone-')
                        ? (
                            <div className="z-0 absolute w-full h-full">
                                <div className="flex justify-center opacity-50 items-center w-full h-full">
                                    <VideoTrack trackRef={trackRef} className='w-full h-full' />
                                </div>
                            </div>
                        )
                        : (
                            <div className="z-0 absolute w-full h-full">
                                <div className="flex justify-center opacity-50 items-center w-full h-full">
                                    <div className="text-white animate-pulse">
                                        Waiting For Stream...
                                    </div>
                                </div>
                            </div>
                        )
                    )
                )}
            </TrackRefContext.Consumer>
        </TrackLoop>
    );
};