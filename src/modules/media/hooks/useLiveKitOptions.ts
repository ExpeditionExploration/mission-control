import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReceivedDataMessage } from '@livekit/components-core';
import type { Room } from 'livekit-client';
import { Track } from 'livekit-client';

/**
 * Declarative configuration for a LiveKit data channel.
 */
export interface DataChannelPreset {
	readonly topic?: string;
	readonly maxMessages?: number;
	readonly onMessage?: (message: ReceivedDataMessage<string | undefined>) => void;
}

/**
 * Declarative configuration for the remote video sources this client cares about.
 */
export interface VideoPreset {
	readonly sources?: Track.Source[];
	readonly subscribeToUnpublished?: boolean;
}

export interface UseLiveKitOptionsParams {
	readonly room?: Room;
	readonly video?: VideoPreset;
	readonly dataChannels?: DataChannelPreset[];
}

export interface UseLiveKitOptionsResult {
	readonly room?: Room;
	readonly dataChannels: DataChannelPreset[];
	readonly video: Required<VideoPreset>;
	readonly addDataChannel: (
		topic?: string,
		maxMessages?: number,
		onMessage?: (message: ReceivedDataMessage<string | undefined>) => void
	) => void;
	readonly removeDataChannel: (topic?: string) => void;
}

const DEFAULT_VIDEO_PRESET: Required<VideoPreset> = {
	sources: [Track.Source.Camera],
	subscribeToUnpublished: false,
};

const DEFAULT_CHANNEL: DataChannelPreset = {
	topic: undefined,
	maxMessages: undefined,
	onMessage: undefined,
};

const normalizeTopic = (raw?: string): string | undefined => {
	const trimmed = raw?.trim();
	return trimmed && trimmed.length > 0 ? trimmed : undefined;
};

const ensureChannelsFallback = (channels: DataChannelPreset[]): DataChannelPreset[] => {
	return channels.length === 0 ? [DEFAULT_CHANNEL] : channels;
};

/**
 * Derives the LiveKit streaming options from the caller's preferences while keeping the
 * declarative presets intact for potential multi-channel expansion.
 */
export function useLiveKitOptions(params: UseLiveKitOptionsParams = {}): UseLiveKitOptionsResult {
	const { room, video, dataChannels } = params;

	const videoSettings = useMemo(() => {
		const cameraList = Array.isArray(video?.sources);
		const effectiveCameraSources: Track.Source[] = cameraList ? (video!.sources as Track.Source[]) : DEFAULT_VIDEO_PRESET.sources;
		return {
			sources: effectiveCameraSources,
			subscribeToUnpublished: video?.subscribeToUnpublished ?? DEFAULT_VIDEO_PRESET.subscribeToUnpublished,
		};
	}, [video?.sources, video?.subscribeToUnpublished]);

	const initialDataChannels = useMemo(() => {
		if (!dataChannels || dataChannels.length === 0) {
			return [DEFAULT_CHANNEL];
		}

		const seen = new Set<string | undefined>();
		const unique: DataChannelPreset[] = [];

		for (const channel of dataChannels) {
			const topic = normalizeTopic(channel.topic);
			if (seen.has(topic)) {
				continue;
			}
			seen.add(topic);
			unique.push({
				topic,
				maxMessages: channel.maxMessages,
				onMessage: channel.onMessage,
			});
		}

		return ensureChannelsFallback(unique);
	}, [dataChannels]);

	const [channelPresets, setChannelPresets] = useState<DataChannelPreset[]>(() => [...initialDataChannels]);

	// Keep state in sync if dataChannels prop changes
	useEffect(() => {
		setChannelPresets([...initialDataChannels]);
	}, [initialDataChannels]);

	const addDataChannel = useCallback((topic?: string, maxMessages?: number, onMessage?: (message: ReceivedDataMessage<string | undefined>) => void) => {
		const normalizedTopic = normalizeTopic(topic);

		setChannelPresets(prev => {
			const next = [...prev];
			const existingIndex = next.findIndex(channel => channel.topic === normalizedTopic);
			const nextPreset: DataChannelPreset = {
				topic: normalizedTopic,
				maxMessages,
				onMessage,
			};

			if (existingIndex >= 0) {
				next[existingIndex] = nextPreset;
				return ensureChannelsFallback(next);
			}

			next.push(nextPreset);
			return ensureChannelsFallback(next);
		});
	}, []);

	const removeDataChannel = useCallback((topic?: string) => {
		const normalizedTopic = normalizeTopic(topic);

		setChannelPresets(prev => {
			const next = prev.filter(channel => channel.topic !== normalizedTopic);
			return ensureChannelsFallback(next);
		});
	}, []);

	return {
		room,
		dataChannels: channelPresets,
		video: videoSettings,
		addDataChannel,
		removeDataChannel,
	};
}