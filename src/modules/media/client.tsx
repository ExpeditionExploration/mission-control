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

        this.on('response-env-var-token-server', async (address: string) => {
            this.logger.info("Received token server address from be:", address);
            this.tokenServer = address;
            if (this.tokenServerRequestInterval) {
                clearInterval(this.tokenServerRequestInterval);
                this.tokenServerRequestInterval = null;
            }
            await this.requestToken();
        });
        this.on('response-env-var-livekit-url', (address: string) => {
            this.logger.info("Received LiveKit URL from be:", address);
            this.livekitHost = address;
            if (this.livekitInterval) {
                clearInterval(this.livekitInterval);
                this.livekitInterval = null;
            }
            this.requestTestStreamStart(true);
        });

        this.requestTokenServer();
        this.requestLiveKitUrl();
    }

    async requestToken() {
        if (!this.tokenServer) {
            this.logger.warn("Token server address not set yet.");
            return null;
        }
        
        this.logger.info("Requesting token from server:", this.tokenServer);
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
        const emitToBe = () => {
            this.logger.info("Requesting token server address from be");
            this.emit<string>('request-env-var', "TOKEN_SERVER");
        };
        emitToBe();
        this.tokenServerRequestInterval = setInterval(emitToBe, 3000);
    }

    requestLiveKitUrl() {
        if (this.livekitInterval) {
            return;
        }
        const requestUrl = () => {
            this.logger.info("Requesting LiveKit URL from be");
            this.emit<string>('request-env-var', "LIVEKIT_URL");
        };
        requestUrl();
        this.livekitInterval = setInterval(requestUrl, 3000);
    }

    // Not at use yet
    // onDataChannelMessage = (message: ReceivedDataMessage<string>) => {
    //     this.logger.info("Received data channel message:", message);
    //     switch (message.topic) {
    //         // Signal drone control messages from here to be.
    //         case "drone-control":
    //             this.logger.info("Drone control message:", message.payload);
    //             // Handle drone control message
    //             break;
    //         case "livekit-stream-status":
    //             if (typeof message.payload === 'string' && message.payload === 'ended') {
    //                 this.logger.warn('LiveKit stream ended notification received; requesting restart');
    //                 this.requestTestStreamStart(true);
    //             }
    //             break;
    //         default:
    //             this.logger.warn("Unknown data channel topic:", message.topic);
    //     }
    // }

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
