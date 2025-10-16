import { Module } from 'src/module';
import { Side, UserInterface } from 'src/client/user-interface';
import { ClientModuleDependencies } from 'src/client/client';
import { MediaContextItem } from './components/MediaContextItem';
import { TakePictureButton } from './components/TakePictureButton';
import { RecordButton } from './components/RecordButton';

export class MediaModuleClient extends Module {
    userInterface: UserInterface;
    tokenServer: string | null = null;
    tokenServerRequestInterval: NodeJS.Timeout | null = null;
    token: string | null = null;
    livekitHost: string | null = null;
    livekitInterval: NodeJS.Timeout | null = null;
    private lastTestStreamRequest = 0;
    private readonly roomName = 'mission-control-test';

    
    constructor(deps: ClientModuleDependencies) {
        super(deps);
        this.userInterface = deps.userInterface;
    }

    onModuleInit(): void | Promise<void> {
        this.userInterface.addContextItem(MediaContextItem);
        this.userInterface.addFooterItem(TakePictureButton, {
            side: Side.Right,
        });
        this.userInterface.addFooterItem(RecordButton, {
            side: Side.Right,
        });

        this.on('response-env-var-token-server', (address: string) => {
            this.logger.info("Received token server address from be:", address);
            this.tokenServer = address;
            if (this.tokenServerRequestInterval) {
                clearInterval(this.tokenServerRequestInterval);
                this.tokenServerRequestInterval = null;
            }
            if (this.livekitHost) {
                void this.requestToken();
            }
        });
        this.on('response-env-var-livekit-host', (address: string) => {
            this.logger.info("Received LiveKit HOST from be:", address);
            this.livekitHost = address;
            if (this.livekitInterval) {
                clearInterval(this.livekitInterval);
                this.livekitInterval = null;
            }
            if (this.tokenServer) {
                void this.requestToken();
            }
            this.requestTestStreamStart(true);
        });

        this.requestTokenServer();
        this.requestLiveKitHost();
    }

    async requestToken() {
        if (!this.tokenServer) {
            this.logger.warn("Token server address not set yet.");
            return null;
        }
        
        this.logger.error(`room: ${this.roomName}`);

        const response = await fetch(`${this.tokenServer}/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                identity: 'mc-client',
                room: this.roomName,
            }),
        });
        if (!response.ok) {
            this.logger.error("Failed to fetch token from server:", response.statusText);
            return null;
        }
        const data = await response.json();
        this.token = data.token;
        return this.token;
    }

    requestTokenServer() {
        if (this.tokenServerRequestInterval) {
            return;
        }
        const requestTokenServer = () => {
            this.logger.info("Requesting token server address from be");
            this.emit<string>('request-env-var', "TOKEN_SERVER");
        };
        requestTokenServer();
        this.tokenServerRequestInterval = setInterval(requestTokenServer, 3000);
    }

    requestLiveKitHost() {
        if (this.livekitInterval) {
            return;
        }
        const requestHost = () => {
            this.logger.info("Requesting LiveKit HOST from be");
            this.emit<string>('request-env-var', "LIVEKIT_HOST");
        };
        requestHost();
        this.livekitInterval = setInterval(requestHost, 3000);
    }


    onDataChannelMessage = (message: ReceivedDataMessage<string>) => {
        this.logger.info("Received data channel message:", message);
        switch (message.topic) {
            // Signal drone control messages from here to be.
            case "drone-control":
                this.logger.info("Drone control message:", message.payload);
                // Handle drone control message
                break;
            case "livekit-stream-status":
                if (typeof message.payload === 'string' && message.payload === 'ended') {
                    this.logger.warn('LiveKit stream ended notification received; requesting restart');
                    this.requestTestStreamStart(true);
                }
                break;
            default:
                this.logger.warn("Unknown data channel topic:", message.topic);
        }
    }

    requestTestStreamStart(force = false) {
        const now = Date.now();
        if (!force && now - this.lastTestStreamRequest < 10_000) {
            this.logger.debug('Skipping LiveKit test stream request; last request too recent');
            return;
        }

        this.lastTestStreamRequest = now;
        this.logger.info('Requesting backend to start LiveKit test stream');
        this.emit('start-livekit-test-stream', undefined);
    }
}
