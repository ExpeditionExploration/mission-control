import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';

@WebSocketGateway() // Specify the port, or it will use the default one
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer()
    server: Server;

    afterInit(server: Server) {
        console.log('WebSocket server initialized!');
    }

    handleConnection(client: WebSocket) {
        console.log('Client connected:', client);
        client.send(JSON.stringify({
            event: 'message',
            data: 'Hello !'
        }));
    }

    handleDisconnect(client: any) {
        console.log('Client disconnected:', client);
    }
}