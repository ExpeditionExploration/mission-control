import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { WindowModule } from './modules/window/window.module';
import { AppGateway } from './app.gateway';

@Module({
    imports: [WindowModule],
    controllers: [],
    providers: [AppService, AppGateway],
    exports: []
})
export class AppModule { }
