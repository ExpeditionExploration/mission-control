import { Module } from '@nestjs/common';
import { WindowService } from './window.service';

@Module({
    imports: [],
    controllers: [],
    providers: [WindowService],
    exports: [WindowService]
})
export class WindowModule { }
