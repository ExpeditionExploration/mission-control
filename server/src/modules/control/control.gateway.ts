import { OnModuleInit } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';

@WebSocketGateway()
export class ControlGateway implements OnModuleInit {
    onModuleInit() {
        console.log('ControlGateway has been initialized.');
    }
    @SubscribeMessage('message')
    handleMessage(client: any, payload: any): any {
        console.log('Client', client, payload);
        // return 'Hello world!';
    }
}
