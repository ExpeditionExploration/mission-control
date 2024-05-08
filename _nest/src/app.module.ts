import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ControlGateway } from './modules/control/control.gateway';
import { GlobalModule } from './global.module';
import { MediaModule } from './modules/media/media.module';
import { AppGateway } from './app.gateway';

@Module({
    imports: [GlobalModule, MediaModule],
    controllers: [AppController],
    providers: [AppService, ControlGateway, AppGateway],
})
export class AppModule { }
