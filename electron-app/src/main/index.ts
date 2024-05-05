import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WsAdapter } from '@nestjs/platform-ws';
import helmet from 'helmet';

const PORT = 16501;
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useWebSocketAdapter(new WsAdapter(app));
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                connectSrc: ["'self'", 'http://127.0.0.1:5173', 'http://localhost:5173']
            }
        }
    }));
    await app.listen(PORT).then(() => {
        console.log(`Server is running on http://localhost:${PORT}`)
    });
}
bootstrap();
