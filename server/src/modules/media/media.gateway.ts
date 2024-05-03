import { SubscribeMessage, WebSocketGateway, WsResponse } from '@nestjs/websockets';

@WebSocketGateway()
export class MediaGateway {
    @SubscribeMessage('media')
    handleMessage(client: any, payload: any): string {
        return 'Hello world!';
    }
}
