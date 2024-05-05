import { Module } from '@nestjs/common';
import { MetadataScanner, Reflector } from '@nestjs/core';
import { DiscoveryService } from '@golevelup/nestjs-discovery';
import { ConnectionService } from './connection.service';
// import { DiscoveryService } from './services/discovery.service';

@Module({
    imports: [],
    controllers: [],
    providers: [DiscoveryService, Reflector, MetadataScanner, ConnectionService],
    exports: [ConnectionService]
})
export class ConnectionModule { }
