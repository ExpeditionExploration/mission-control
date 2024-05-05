import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WindowService } from './services/window.service';
import { ConnectionModule } from './connection/connection.module';

@Global()
@Module({
    imports: [ConfigModule.forRoot({
        isGlobal: true,
    }), ConnectionModule],
    controllers: [],
    providers: [WindowService],
    exports: [WindowService]
})
export class GlobalModule { }
