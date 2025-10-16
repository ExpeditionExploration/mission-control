import { ViewProps } from 'src/client/user-interface';
import { type MediaModuleClient } from '../client';
import { useEffect, useState } from 'react';
import { LiveKitRoom } from '@livekit/components-react';
import { Tracks } from "./Tracks";

export const MediaContextItem: React.FC<ViewProps<MediaModuleClient>> = ({
    module,
}) => {
    const [token, setToken] = useState<string | null>(module.token);
    const [livekitHost, setLivekitHost] = useState<string | null>(module.livekitHost ?? null);
    const [tokenServer, setTokenServer] = useState<string | null>(module.tokenServer);

    useEffect(() => {
        const handleTokenServerResponse = (address: string) => {
            setTokenServer(address);
        };

        const handleLivekitHostResponse = (address: string) => {
            setLivekitHost(address);
        };

        module.on('response-env-var-token-server', handleTokenServerResponse);
        module.on('response-env-var-livekit-host', handleLivekitHostResponse);
        module.requestTokenServer();
        module.requestLiveKitHost();

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
            module.off('response-env-var-livekit-host', handleLivekitHostResponse);
        };
    }, [module]);

    useEffect(() => {
        let cancelled = false;
        if (!tokenServer || !livekitHost) {
            setToken(null);
            return undefined;
        }

        if (module.token) {
            setToken(module.token);
            return undefined;
        }

        const fetchToken = async () => {
            const fetchedToken = await module.requestToken();
            if (!cancelled) {
                setToken(fetchedToken);
            }
        };

        fetchToken().catch((err) => {
            console.error('Error fetching token:', err);
            if (!cancelled) {
                setToken(null);
            }
        });

        return () => {
            cancelled = true;
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
