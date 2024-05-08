import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WsAdapter } from '@nestjs/platform-ws';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useWebSocketAdapter(new WsAdapter(app));

    const port = app.get(ConfigService).get('PORT');
    await app.listen(port).then(() => {
        console.log(`Server is running on http://localhost:${port}`)
    });
}
bootstrap();
