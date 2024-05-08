import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
    imports: [ConfigModule.forRoot()],
    controllers: [],
    providers: [],
    exports: []
})
export class GlobalModule { }
