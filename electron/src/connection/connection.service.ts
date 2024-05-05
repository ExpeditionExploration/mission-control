import { DiscoveredClassWithMeta, DiscoveredMethod, DiscoveredMethodWithMeta, DiscoveredModule, DiscoveryService } from '@golevelup/nestjs-discovery';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { MetadataScanner, Reflector } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { WebSocketGateway, SubscribeMessage, WsResponse, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { GATEWAY_METADATA, MESSAGE_MAPPING_METADATA, MESSAGE_METADATA } from '@nestjs/websockets/constants';
import WebSocket from 'ws';

@Injectable()
export class ConnectionService implements OnModuleInit {
    logger = new Logger(ConnectionService.name);
    private websocket?: WebSocket;

    constructor(
        private readonly discoveryService: DiscoveryService,
        private readonly reflector: Reflector,
    ) { }

    onModuleInit() {
        this.getCallbacks();
    }

    private callbacks: Map<string, Function[]> = new Map();
    private gateways: Set<any> = new Set();
    private async getCallbacks() {
        const methods = await this.discoveryService.providerMethodsWithMetaAtKey<string>(MESSAGE_METADATA);
        const discoverdMethods = methods.filter((method) => this.reflector.get(GATEWAY_METADATA, method.discoveredMethod.parentClass.dependencyType));

        discoverdMethods.forEach(({ meta: event, discoveredMethod }) => {
            if (!event) return;
            if (!this.callbacks.has(event)) {
                this.callbacks.set(event, []);
            }
            this.logger.debug(`Mapping gateway message callback for "${event}" from ${discoveredMethod.parentClass.name}`);
            this.callbacks.get(event).push(discoveredMethod.handler);
            this.gateways.add(discoveredMethod.parentClass.instance as any);
        });

        this.logger.debug(`Found ${this.callbacks.size} message mappings`);
    }

    reconnectTimeout = 5000;
    connect(host: string) {
        if (this.websocket) {
            this.websocket.removeAllListeners();
            this.websocket.close();
        }

        const ws = new WebSocket(host);
        ws.on('open', () => {
            this.gateways.forEach((gateway) => {
                if (gateway?.handleConnection) {
                    gateway.handleConnection(ws);
                }
            });
        });

        ws.on('message', (data: string) => {
            try {
                // this.logger.log(`Received message: ${data}`);
                const payload: WsResponse = JSON.parse(data);
                if (payload.event && payload.data) {
                    const callbacks = this.callbacks.get(payload.event);
                    if (callbacks) {
                        callbacks.forEach((handler) => handler(payload.data));
                    }
                }
            } catch (error) { }
        });

        ws.on('close', () => {
            this.gateways.forEach((gateway) => {
                if (gateway?.handleConnection) {
                    gateway.handleConnection(ws);
                }
            });

            if (this.reconnectTimeout > 0)
                setTimeout(() => this.connect(host), this.reconnectTimeout);
        });

        return ws;
    }

    send(event: string, data: any) {
        this.websocket?.send(JSON.stringify({ event, data }));
    }
}