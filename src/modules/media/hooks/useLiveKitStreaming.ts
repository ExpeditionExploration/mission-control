import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReceivedDataMessage } from '@livekit/components-core';
import { useDataChannel, useRoomContext, useTracks } from '@livekit/components-react';
import type { TrackReference } from '@livekit/components-core';
import type { DataPublishOptions, Room } from 'livekit-client';
import { RoomEvent, Track, RemoteTrackPublication, TrackPublication, type Participant } from 'livekit-client';
import type { UseLiveKitOptionsResult } from './useLiveKitOptions';
import { CircularBuffer } from '../utils/circularBuffer';

/**
 * LiveKit data-channel message with added local timestamp for UI rendering.
 */
export interface LiveKitDataMessage extends ReceivedDataMessage<string | undefined> {
    receivedAt: Date;
}

export interface StreamingDataChannelState {
    topic?: string;
    messages: LiveKitDataMessage[];
    latestMessage?: LiveKitDataMessage;
}

export interface VideoStreamInfo {
    id: string;
    participantIdentity: string;
    participantName?: string;
    source: Track.Source;
    trackSid: string;
    trackName?: string;
    isLocal: boolean;
    isSubscribed: boolean;
    isMuted: boolean;
    hasVideoTrack: boolean;
    publication?: TrackPublication;
}

export interface UseLiveKitStreamingResult {
    room: Room | undefined;
    tracks: TrackReference[];
    latestMessage?: LiveKitDataMessage;
    messages: LiveKitDataMessage[];
    channels: StreamingDataChannelState[];
    sendData: (payload: Uint8Array, topic?: string, options?: DataPublishOptions) => Promise<void>;
    isSending: boolean;
    videoStreams: VideoStreamInfo[];
    subscribeToVideoStream: (streamId: string) => void;
    unsubscribeFromVideoStream: (streamId: string) => void;
}

const DEFAULT_SOURCES: Track.Source[] = [Track.Source.Camera];
const DEFAULT_TOPIC_KEY = '__default__';
const DEFAULT_MAX_MESSAGES = 32;
const VIDEO_TRACK_SOURCES: Track.Source[] = [Track.Source.Camera, Track.Source.ScreenShare, Track.Source.Unknown];
const topicKey = (topic?: string): string => (topic ?? DEFAULT_TOPIC_KEY);

/**
 * Subscribes to remote media tracks and the LiveKit data channel, returning the
 * track references required by LiveKit UI components together with a rolling
 * log of the most recent data-channel messages.
 *
 * @param options LiveKit streaming preferences derived from useLiveKitOptions.
 */
export function useLiveKitStreaming(options: UseLiveKitOptionsResult): UseLiveKitStreamingResult {
    const { room, video, dataChannels } = options;

    const configuredSources = video.sources ?? DEFAULT_SOURCES;
    const primaryVideoSource = configuredSources.length > 0 ? configuredSources[0] : undefined;

    const videoSourcesToObserve = useMemo<Track.Source[]>(() => {
        const seed = new Set<Track.Source>(VIDEO_TRACK_SOURCES);
        configuredSources.forEach(source => seed.add(source));
        return Array.from(seed);
    }, [configuredSources]);

    const contextRoom = useRoomContext();
    const activeRoom = room ?? contextRoom;

    const channelConfigs = useMemo(() => {
        const base = dataChannels && dataChannels.length > 0
            ? dataChannels
            : [
                  {
                      topic: undefined,
                      maxMessages: undefined,
                      onMessage: undefined,
                  },
              ];

        const unique = new Map<string, { topic?: string; onMessage?: (message: ReceivedDataMessage<string | undefined>) => void; maxMessages: number }>();

        base.forEach(channel => {
            const key = topicKey(channel.topic);
            if (unique.has(key)) {
                return;
            }

            const maxMessages = channel.maxMessages ?? DEFAULT_MAX_MESSAGES;
            unique.set(key, {
                topic: channel.topic,
                onMessage: channel.onMessage,
                maxMessages: maxMessages > 0 ? maxMessages : DEFAULT_MAX_MESSAGES,
            });
        });

        return Array.from(unique.values());
    }, [dataChannels]);

    const handleIncomingMessage = useCallback(
        (msg: ReceivedDataMessage<string | undefined>) => {
            channelConfigs.forEach(config => {
                if (!config.topic || config.topic === msg.topic) {
                    config.onMessage?.(msg);
                }
            });
        },
        [channelConfigs]
    );

    const primaryTopic = channelConfigs.length === 1 ? channelConfigs[0].topic : undefined;

    const dataChannel = primaryTopic
        ? useDataChannel(primaryTopic, handleIncomingMessage)
        : useDataChannel(handleIncomingMessage);

    const { message: latestRawMessage, send, isSending } = dataChannel;

    const allTrackReferences = useTracks(videoSourcesToObserve, {
        room: activeRoom,
        onlySubscribed: true,
    });

    const tracks = useMemo<TrackReference[]>(() => {
        return allTrackReferences.filter(reference => {
            const publication = reference.publication;
            if (!publication) {
                return false;
            }

            if (publication.kind && publication.kind !== Track.Kind.Video) {
                return false;
            }

            const isMuted = publication.isMuted ?? false;
            if (isMuted) {
                return false;
            }

            const hasVideoTrack = Boolean(publication.videoTrack);
            return hasVideoTrack;
        });
    }, [allTrackReferences]);

    const [videoRevision, setVideoRevision] = useState(0);
    const [participantRevision, setParticipantRevision] = useState(0);

    const roomState = activeRoom?.state;

    useEffect(() => {
        const localParticipant = activeRoom?.localParticipant;
        if (!localParticipant || roomState !== 'connected') {
            return;
        }

        const wantsCamera = primaryVideoSource === Track.Source.Camera;
        const publication = localParticipant.getTrackPublication(Track.Source.Camera);
        const hasVideoTrack = Boolean(publication?.videoTrack);
        const isMuted = publication?.isMuted ?? true;

        if (wantsCamera && hasVideoTrack && !isMuted) {
            return;
        }

        if (!wantsCamera && (!hasVideoTrack || isMuted)) {
            return;
        }

        let cancelled = false;

        (async () => {
            try {
                await localParticipant.setCameraEnabled(wantsCamera);
                if (!cancelled) {
                    setVideoRevision(prev => prev + 1);
                }
            } catch (error) {
                if (!cancelled) {
                    console.warn('useLiveKitStreaming: failed to toggle camera', error);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [activeRoom, primaryVideoSource, roomState]);

    useEffect(() => {
        const roomInstance = activeRoom;
        if (!roomInstance) {
            return;
        }

        const handleParticipantUpdate = () => {
            setParticipantRevision(prev => prev + 1);
        };

        const trackedEvents: RoomEvent[] = [
            RoomEvent.ParticipantConnected,
            RoomEvent.ParticipantDisconnected,
            RoomEvent.TrackPublished,
            RoomEvent.TrackUnpublished,
            RoomEvent.TrackSubscribed,
            RoomEvent.TrackUnsubscribed,
            RoomEvent.TrackMuted,
            RoomEvent.TrackUnmuted,
            RoomEvent.LocalTrackPublished,
            RoomEvent.LocalTrackUnpublished,
        ];

        trackedEvents.forEach(event => roomInstance.on(event, handleParticipantUpdate));

        return () => {
            trackedEvents.forEach(event => roomInstance.off(event, handleParticipantUpdate));
        };
    }, [activeRoom]);

    const buffersRef = useRef<Map<string, CircularBuffer<LiveKitDataMessage>>>(new Map());
    const [revision, setRevision] = useState(0);

    useEffect(() => {
        const buffers = buffersRef.current;
        const activeKeys = new Set<string>();

        channelConfigs.forEach(config => {
            const key = topicKey(config.topic);
            activeKeys.add(key);

            const existing = buffers.get(key);
            if (!existing) {
                buffers.set(key, new CircularBuffer<LiveKitDataMessage>(config.maxMessages));
                return;
            }

            if (existing.getCapacity() !== config.maxMessages) {
                const retained = existing.toArray();
                const nextBuffer = new CircularBuffer<LiveKitDataMessage>(config.maxMessages);
                retained.slice(-config.maxMessages).forEach(message => nextBuffer.push(message));
                buffers.set(key, nextBuffer);
            }
        });

        Array.from(buffers.keys()).forEach(key => {
            if (!activeKeys.has(key)) {
                buffers.delete(key);
            }
        });

        setRevision(prev => prev + 1);
    }, [channelConfigs]);

    useEffect(() => {
        if (!latestRawMessage) {
            return;
        }

        channelConfigs.forEach(config => {
            if (!config.topic || config.topic === latestRawMessage.topic) {
                config.onMessage?.(latestRawMessage);
            }
        });

        const enriched: LiveKitDataMessage = {
            ...latestRawMessage,
            receivedAt: new Date(),
        };

        const buffers = buffersRef.current;
        const messageTopicKey = topicKey(latestRawMessage.topic);
        const targetBuffer = buffers.get(messageTopicKey);
        if (targetBuffer) {
            targetBuffer.push(enriched);
        }

        if (messageTopicKey !== DEFAULT_TOPIC_KEY) {
            const defaultBuffer = buffers.get(DEFAULT_TOPIC_KEY);
            if (defaultBuffer) {
                defaultBuffer.push(enriched);
            }
        }

        setRevision(prev => prev + 1);
    }, [channelConfigs, latestRawMessage]);

    const sendData = useCallback(
        (payload: Uint8Array, topic?: string, options?: DataPublishOptions) => {
            const overrides = options ? { ...options } : {};

            const resolvedTopic = topic ?? channelConfigs[0]?.topic;
            if (resolvedTopic) {
                overrides.topic = resolvedTopic;
            }

            return send(payload, overrides);
        },
        [channelConfigs, send]
    );

    const channels = useMemo<StreamingDataChannelState[]>(() => {
        const buffers = buffersRef.current;
        return channelConfigs.map(config => {
            const key = topicKey(config.topic);
            const buffer = buffers.get(key);
            const messages = buffer ? buffer.toArray() : [];
            return {
                topic: config.topic,
                messages,
                latestMessage: messages[messages.length - 1],
            };
        });
    }, [channelConfigs, revision]);

    const primaryMessages = useMemo(() => {
        const buffers = buffersRef.current;
        const primaryKey = topicKey(channelConfigs[0]?.topic);
        const buffer = buffers.get(primaryKey);
        return buffer ? buffer.toArray() : [];
    }, [channelConfigs, revision]);

    const videoStreams = useMemo<VideoStreamInfo[]>(() => {
        if (!activeRoom) {
            return [];
        }

        const streams: VideoStreamInfo[] = [];

        const collectFromParticipant = (participant: Participant | undefined) => {
            if (!participant) {
                return;
            }

            participant.getTrackPublications().forEach(publication => {
                if (publication.kind !== Track.Kind.Video) {
                    return;
                }

                const trackSid = publication.trackSid ?? `${participant.identity}-${publication.source}`;
                const isLocal = participant.isLocal;
                const remotePublication = !isLocal && publication instanceof RemoteTrackPublication ? publication : undefined;
                streams.push({
                    id: trackSid,
                    participantIdentity: participant.identity,
                    participantName: participant.name,
                    source: publication.source ?? Track.Source.Unknown,
                    trackSid,
                    trackName: publication.trackName,
                    isLocal,
                    isSubscribed: isLocal ? Boolean(publication.videoTrack) : remotePublication?.isSubscribed ?? false,
                    isMuted: publication.isMuted ?? false,
                    hasVideoTrack: Boolean(publication.videoTrack),
                    publication,
                });
            });
        };

        collectFromParticipant(activeRoom.localParticipant);
        activeRoom.remoteParticipants.forEach(participant => collectFromParticipant(participant));

        return streams;
    }, [activeRoom, participantRevision, videoRevision]);

    const subscribeToVideoStream = useCallback(
        (streamId: string) => {
            const target = videoStreams.find(stream => stream.id === streamId);
            if (!target || target.isLocal || !target.publication) {
                return;
            }

            const remotePublication = target.publication instanceof RemoteTrackPublication ? target.publication : undefined;
            if (!remotePublication || remotePublication.isSubscribed) {
                return;
            }

            remotePublication.setSubscribed(true);
            setParticipantRevision(prev => prev + 1);
        },
        [videoStreams]
    );

    const unsubscribeFromVideoStream = useCallback(
        (streamId: string) => {
            const target = videoStreams.find(stream => stream.id === streamId);
            if (!target || target.isLocal || !target.publication) {
                return;
            }

            const remotePublication = target.publication instanceof RemoteTrackPublication ? target.publication : undefined;
            if (!remotePublication || !remotePublication.isSubscribed) {
                return;
            }

            remotePublication.setSubscribed(false);
            setParticipantRevision(prev => prev + 1);
        },
        [videoStreams]
    );

    return {
        room: activeRoom,
        tracks,
        latestMessage: primaryMessages[primaryMessages.length - 1],
        messages: primaryMessages,
        channels,
        sendData,
        isSending,
        videoStreams,
        subscribeToVideoStream,
        unsubscribeFromVideoStream,
    };
}