import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ControlModule } from './control/control.module';
import { MetadataScanner, Reflector } from '@nestjs/core';
import { AppGateway } from './app.gateway';
import { DiscoveryService } from '@golevelup/nestjs-discovery';
import { ConnectionModule } from './connection/connection.module';
// import { DiscoveryService } from './services/discovery.service';

@Module({
    imports: [ControlModule],
    controllers: [],
    providers: [AppService],
    exports: []
})
export class AppModule { }
