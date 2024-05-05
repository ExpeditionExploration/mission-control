import { Module } from '@nestjs/common';
import { ControlService } from './control.service';
import { ControlGateway } from './control.gateway';

@Module({
    controllers: [],
    providers: [ControlService, ControlGateway],
})
export class ControlModule { }
