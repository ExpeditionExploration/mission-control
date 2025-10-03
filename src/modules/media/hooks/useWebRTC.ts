import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Internal symbol to flag in-progress negotiation on a RTCPeerConnection instance
const kMakingOffer = Symbol('makingOffer');

export type WebRTCRole = 'sender' | 'receiver';

export interface UseWebRTCOptions {
  signalingUrl: string; // e.g. ws://localhost:8080
  role: WebRTCRole;
  iceServers?: RTCIceServer[]; // e.g. [{ urls: 'stun:stun.l.google.com:19302' }]
  usedStunServers?: string[]; // optional: list of STUN urls you intend to use (for telemetry/validation)
  debug?: boolean;
}

export interface UseWebRTCResult {
  // Streams
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;

  // Controls
  startCapture: (kind?: 'display' | 'camera', constraints?: MediaStreamConstraints) => Promise<void>;
  stopCapture: () => Promise<void>;
  startConnection: () => Promise<void>;
  hangup: () => Promise<void>;

  // States
  isConnected: boolean;
  connectionState: RTCPeerConnectionState | '';
  iceConnectionState: RTCIceConnectionState | '';
  signalingState: RTCSignalingState | '';
  error: string | null;

  // Diagnostics
  usedStunServers: string[];
  socketState: 'connecting' | 'open' | 'closing' | 'closed';
  lastSignal: string | null;
}

// Small helper for logging
function log(debug: boolean | undefined, ...args: any[]) {
  if (debug) console.log('[useWebRTC]', ...args);
}

export function useWebRTC(opts: UseWebRTCOptions): UseWebRTCResult {
  const { signalingUrl, role, iceServers, usedStunServers = [], debug } = opts;

  const wsRef = useRef<WebSocket | null>(null);
  const lastRoleRef = useRef<WebRTCRole | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState | ''>('');
  const [iceConnectionState, setIceConnectionState] = useState<RTCIceConnectionState | ''>('');
  const [signalingState, setSignalingState] = useState<RTCSignalingState | ''>('');
  const [socketState, setSocketState] = useState<'connecting' | 'open' | 'closing' | 'closed'>('closed');
  const [lastSignal, setLastSignal] = useState<string | null>(null);

  const config = useMemo<RTCConfiguration>(() => ({
    iceServers: iceServers && iceServers.length > 0
      ? iceServers
      : [{ urls: 'stun:stun.l.google.com:19302' }],
  }), [iceServers]);

  // Create or return existing RTCPeerConnection
  const ensurePeerConnection = useCallback(() => {
    if (pcRef.current) return pcRef.current;
    const pc = new RTCPeerConnection(config);
    pcRef.current = pc;
    (pc as any)[kMakingOffer] = false; // init negotiation flag

    pc.onconnectionstatechange = () => setConnectionState(pc.connectionState);
    pc.oniceconnectionstatechange = () => setIceConnectionState(pc.iceConnectionState);
    pc.onsignalingstatechange = () => setSignalingState(pc.signalingState);

    pc.onicecandidate = (event) => {
      if (wsRef.current?.readyState !== WebSocket.OPEN) return;
      // Send candidate or end-of-candidates (null) to help completeness on Safari
      const payload = { type: 'iceCandidate', candidate: event.candidate ?? null } as any;
      log(debug, 'Sending ICE candidate', event.candidate ? '' : '(end)');
      wsRef.current.send(JSON.stringify(payload));
      setLastSignal(event.candidate ? 'tx:iceCandidate' : 'tx:iceCandidate:end');
    };

    pc.ontrack = (event) => {
      // Always add the exact event.track to the remote MediaStream
      let stream = remoteStreamRef.current;
      if (!stream) {
        stream = new MediaStream();
        remoteStreamRef.current = stream;
        setRemoteStream(stream);
      }
      const track = event.track;
      if (track && !stream.getTracks().find(t => t.id === track.id)) {
        stream.addTrack(track);
      }
    };

    // For receivers, proactively add transceivers to ensure we can accept incoming tracks
    try {
      if (role === 'receiver') {
        pc.addTransceiver('video', { direction: 'recvonly' });
        pc.addTransceiver('audio', { direction: 'recvonly' });
      }
    } catch {}

    return pc;
  }, [config, debug, role]);

  // WebSocket signaling
  const connectSignaling = useCallback(async () => {
    // If a socket exists and role unchanged, keep it; if role changed, reconnect
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      if (lastRoleRef.current !== role) {
        try { wsRef.current.close(); } catch {}
        wsRef.current = null;
      } else {
        return;
      }
    }

    return new Promise<void>((resolve, reject) => {
      try {
        setSocketState('connecting');
        const ws = new WebSocket(signalingUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          log(debug, 'Signaling connected');
          ws.send(JSON.stringify({ type: role }));
          lastRoleRef.current = role;
          setSocketState('open');
          setLastSignal('open');
          setError(null);
          resolve();
        };

        ws.onerror = (e: any) => {
          // Provide a more actionable error message
          const msg = typeof e?.message === 'string' && e.message.length
            ? e.message
            : `Signaling socket error (check that the server is running at ${signalingUrl})`;
          setError(msg);
          setLastSignal('ws:error');
          reject(e);
        };

        ws.onmessage = async (event) => {
          try {
            const message = JSON.parse(event.data);
            const pc = ensurePeerConnection();

            if (message.type === 'createOffer' && role === 'receiver') {
              log(debug, 'Received offer');
              setLastSignal('rx:createOffer');
              await pc.setRemoteDescription(new RTCSessionDescription(message.sdp));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              ws.send(JSON.stringify({ type: 'createAnswer', sdp: pc.localDescription }));
              setLastSignal('tx:createAnswer');
            } else if (message.type === 'createAnswer' && role === 'sender') {
              log(debug, 'Received answer');
              setLastSignal('rx:createAnswer');
              await pc.setRemoteDescription(new RTCSessionDescription(message.sdp));
            } else if (message.type === 'iceCandidate') {
              log(debug, 'Received ICE candidate');
              setLastSignal('rx:iceCandidate');
              if (message.candidate) {
                await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
              } else {
                // end-of-candidates
                await pc.addIceCandidate(null);
              }
            } else if (message.type === 'peer:receiver-ready' && role === 'sender') {
              // If sender is stable and has local tracks but no remote tracks yet, trigger a re-offer
              const hasRemote = !!remoteStreamRef.current && remoteStreamRef.current.getTracks().length > 0;
              const hasLocal = !!localStreamRef.current && localStreamRef.current.getTracks().length > 0;
              if (pc.signalingState === 'stable' && hasLocal && !hasRemote) {
                try {
                  (pc as any)[kMakingOffer] = true;
                  const offer = await pc.createOffer();
                  await pc.setLocalDescription(offer);
                  ws.send(JSON.stringify({ type: 'createOffer', sdp: pc.localDescription }));
                  setLastSignal('tx:createOffer');
                } finally {
                  (pc as any)[kMakingOffer] = false;
                }
              }
            } else if (message.type === 'peer:sender-ready' && role === 'receiver') {
              // Ensure transceivers are present so ontrack will fire
              try {
                pc.addTransceiver('video', { direction: 'recvonly' });
                pc.addTransceiver('audio', { direction: 'recvonly' });
              } catch {}
            }
          } catch (err: any) {
            setError(err?.message ?? 'Error processing signaling message');
          }
        };

        ws.onclose = () => {
          if (wsRef.current === ws) wsRef.current = null;
          setSocketState('closed');
          setLastSignal('closed');
        };
      } catch (err: any) {
        setError(err?.message ?? 'Failed to open signaling socket');
        reject(err);
      }
    });
  }, [debug, role, signalingUrl, ensurePeerConnection]);

  const startConnection = useCallback(async () => {
    try {
      setError(null);
      await connectSignaling();
      const pc = ensurePeerConnection();
      if (role === 'sender') {
        pc.onnegotiationneeded = async () => {
          try {
            // Guard: avoid concurrent negotiations
            if ((pc as any)[kMakingOffer]) return;
            (pc as any)[kMakingOffer] = true;
            log(debug, 'Negotiation needed -> creating offer');
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            wsRef.current?.send(JSON.stringify({ type: 'createOffer', sdp: pc.localDescription }));
            setLastSignal('tx:createOffer');
          } catch (err: any) {
            setError(err?.message ?? 'Failed during negotiation');
          } finally {
            (pc as any)[kMakingOffer] = false;
          }
        };
      }

      // Attach any existing local tracks AFTER setting negotiationneeded handler
      if (localStreamRef.current) {
        const existing = pc.getSenders().map(s => s.track).filter(Boolean) as MediaStreamTrack[];
        localStreamRef.current.getTracks().forEach((t) => {
          if (!existing.find(et => et && et.id === t.id)) {
            pc.addTrack(t, localStreamRef.current!);
          }
        });
      }
    } catch (err: any) {
      console.log('ERROR:', err);
      setError(err?.message || 'Failed to start connection');
    }
  }, [connectSignaling, ensurePeerConnection, debug, role]);

  const startCapture = useCallback(async (kind: 'display' | 'camera' = 'camera', constraints?: MediaStreamConstraints) => {
    try {
      // Stop existing first
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = kind === 'display'
        ? await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false, ...constraints })
        : await navigator.mediaDevices.getUserMedia({ video: true, audio: false, ...constraints });

      localStreamRef.current = stream;
      setLocalStream(stream);

      // If pc exists, add tracks now (avoid duplicates)
      const pc = pcRef.current;
      if (pc) {
        const existing = pc.getSenders().map(s => s.track).filter(Boolean) as MediaStreamTrack[];
        stream.getTracks().forEach((track) => {
          if (!existing.find(et => et && et.id === track.id)) {
            pc.addTrack(track, stream);
          }
        });
      }
    } catch (err: any) {
      setError(err?.message ?? 'Failed to start capture');
    }
  }, []);

  const stopCapture = useCallback(async () => {
    try {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
        setLocalStream(null);
      }
    } catch (err: any) {
      setError(err?.message ?? 'Failed to stop capture');
    }
  }, []);

  const hangup = useCallback(async () => {
    try {
      wsRef.current?.close();
      wsRef.current = null;
      if (pcRef.current) {
        pcRef.current.getSenders().forEach((s) => s.track?.stop());
        pcRef.current.getReceivers().forEach((r) => r.track?.stop());
        pcRef.current.close();
        pcRef.current = null;
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
      if (remoteStreamRef.current) {
        remoteStreamRef.current.getTracks().forEach((t) => t.stop());
        remoteStreamRef.current = null;
      }
      setLocalStream(null);
      setRemoteStream(null);
      setConnectionState('');
      setIceConnectionState('');
      setSignalingState('');
    } catch (err: any) {
      setError(err?.message ?? 'Failed to hang up');
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      wsRef.current?.close();
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      remoteStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const isConnected = connectionState === 'connected' || iceConnectionState === 'connected';

  // Validate usedStunServers presence in config (informational)
  useEffect(() => {
    if (!usedStunServers.length) return;
    const configured = new Set((config.iceServers || [])
      .flatMap(s => Array.isArray(s.urls) ? s.urls : [s.urls])
      .filter(Boolean) as string[]);
    const missing = usedStunServers.filter(u => !configured.has(u));
    if (missing.length) {
      log(debug, 'Some usedStunServers are not present in iceServers config:', missing);
    }
  }, [config, usedStunServers, debug]);

  return {
    localStream,
    remoteStream,
    startCapture,
    stopCapture,
    startConnection,
    hangup,
    isConnected,
    connectionState,
    iceConnectionState,
    signalingState,
    error,
    usedStunServers,
    socketState,
    lastSignal,
  };
}

export default useWebRTC;