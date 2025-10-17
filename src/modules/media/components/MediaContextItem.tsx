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

        const fetchToken = async (): Promise<any> => {
            try {
                const token = await module.requestToken();
                if (!token) {
                    return false;
                }             
                setToken(token);
                module.logger.info("Token fetched successfully.");
                return true;
            } catch (_error) {
                return false; // Suppress exception
            }
        };

        fetchToken()
            .then((gotIt) => {
                if (gotIt) {
                    module.logger.info('LiveKit token fetched successfully.');
                } else {
                    module.logger.info('Setting token retry interval.');
                    tokenRetryTimerRef.current = setInterval(() => {
                    if (!tokenRetryCountRef.current) {
                        module.logger.error("Token fetch retries exhausted, stopping.");
                        clearInterval(tokenRetryTimerRef.current);
                        tokenRetryTimerRef.current = null;
                        return;
                    }
                    fetchToken()
                        .then()
                        .catch((err) => {
                            module.logger.warn('Could not fetch token:', err);
                            tokenRetryCountRef.current -= 1;
                        });
                }, waitBeforeRetryMs);
            }}).catch((err) => {
                module.logger.warn('Could not fetch LiveKit token:', err);
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
                onError={(e) => module.logger.warn("LiveKit error:", e)}
            >
                <Tracks module={module} />
            </LiveKitRoom>
        </div>
    );
};
