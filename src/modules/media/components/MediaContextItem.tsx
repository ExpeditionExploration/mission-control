import { ViewProps } from 'src/client/user-interface';
import { type MediaModuleClient } from '../client';
import { useEffect, useRef, useState } from 'react';
import { LiveKitRoom } from '@livekit/components-react';
import { Tracks } from "./Tracks";

export const MediaContextItem: React.FC<ViewProps<MediaModuleClient>> = ({
    module,
}) => {
    const [token, setToken] = useState<string | null>(module.token);
    const [livekitHost, setLivekitHost] = useState<string | null>(module.livekitHost ?? null);
    const [tokenServer, setTokenServer] = useState<string | null>(module.tokenServer);

    const tokenRetryTimerRef = useRef<NodeJS.Timeout | null>(null);
    const tokenRetryCountRef = useRef<number>(6);
    const waitBeforeRetryMs = 10_000;

    useEffect(() => {
        const handleTokenServerResponse = (address: string) => {
            setTokenServer(address);
        };

        const handleLivekitHostResponse = (address: string) => {
            setLivekitHost(address);
        };

        module.on('response-env-var-token-server', handleTokenServerResponse);
        module.on('response-env-var-livekit-url', handleLivekitHostResponse);
        module.requestTokenServer();
        module.requestLiveKitUrl();

        if (module.tokenServer) {
            setTokenServer(module.tokenServer);
        }
        if (module.livekitHost) {
            setLivekitHost(module.livekitHost);
        }
        if (module.token) {
            setToken(module.token);
        }

        return () => {
            module.off('response-env-var-token-server', handleTokenServerResponse);
            module.off('response-env-var-livekit-url', handleLivekitHostResponse);
        };
    }, [module]);

    useEffect(() => {
        if (!tokenServer || !livekitHost) {
            // Can't fetch token until we have token server addr
            return;
        }

        const fetchToken = async () => {
            const token = await module.requestToken();
            setToken(token);
        };

        fetchToken()
            .then(() => console.info("Token fetched successfully."))
            .catch((err) => {
                console.warn('Error fetching LiveKit token. Setting retry interval.');
                tokenRetryTimerRef.current = setInterval(() => {
                    if (!tokenRetryCountRef.current) {
                        console.error("Token fetch retries exhausted, stopping.");
                        clearInterval(tokenRetryTimerRef.current);
                        tokenRetryTimerRef.current = null;
                        return;
                    }
                    fetchToken()
                        .then(() => {
                            console.info("Token fetched successfully on retry.");
                        })
                        .catch((err) => {
                            tokenRetryCountRef.current -= 1;
                        });
                }, waitBeforeRetryMs);
            });

        return () => {
            if (tokenRetryTimerRef.current) {
                clearInterval(tokenRetryTimerRef.current);
            }
        };
    }, [module, tokenServer, livekitHost]);

    const shouldConnect = Boolean(token && livekitHost);

    return (
        <div className="absolute inset-0 w-full h-full">
            <LiveKitRoom
                token={token ?? undefined}
                serverUrl={livekitHost ?? undefined}
                connect={shouldConnect}
            >
                <Tracks module={module} />
            </LiveKitRoom>
        </div>
    );
};
