import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';

@WebSocketGateway() // Specify the port, or it will use the default one
export class AppGateway {

    @SubscribeMessage('message')
    handleMessage(client: any, payload: any): any {
        console.log('Client', client, payload);
        return 'Hello world!';
    }
}