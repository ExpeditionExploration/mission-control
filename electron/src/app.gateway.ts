import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';

@WebSocketGateway() // Specify the port, or it will use the default one
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer()
    server: Server;

    afterInit(server: Server) {
        console.log('WebSocket server initialized!');
        const ws = new WebSocket('ws://localhost:16500')
        server.emit('connection', ws)
    }

    handleConnection(client: any, ...args: any[]) {
        console.log('Client connected:', client.id);
    }

    handleDisconnect(client: any) {
        console.log('Client disconnected:', client.id);
    }

    @SubscribeMessage('message')
    handleMessage(client: any, payload: any) {
        // Broadcast message to all connected clients
        console.log('Client', client, payload);
    }
}