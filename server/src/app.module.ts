import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ControlGateway } from './modules/control/control.gateway';
import { GlobalModule } from './global.module';
import { MediaGateway } from './modules/media/media.gateway';

@Module({
    imports: [GlobalModule],
    controllers: [AppController],
    providers: [AppService, ControlGateway, MediaGateway],
})
export class AppModule { }
