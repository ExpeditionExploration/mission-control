import { OnModuleInit } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WsResponse } from '@nestjs/websockets';
import { MediaService } from './media.service';


@WebSocketGateway()
export class MediaGateway {
    constructor(private readonly mediaService: MediaService) { }

    @SubscribeMessage('media:startStream')
    startStream(client: any, payload: any): string {
        return 'Hello world!';
    }

    @SubscribeMessage('media:stopStream')
    stopStream(client: any, payload: any): string {
        return 'Hello world!';
    }

    @SubscribeMessage('media:recordStart')
    startRecording(client: any, payload: any): string {
        return 'Hello world!';
    }

    @SubscribeMessage('media:settings')
    setSettings(client: any, payload: any): string {
        return 'Hello world!';
    }

    @SubscribeMessage('media:getDevices')
    getDevices(client: any, payload: any) {
        return this.mediaService.getDevices();
    }
}
