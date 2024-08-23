import { Module } from 'src/module';

export class LightsModuleServer extends Module {
    onModuleInit(): void | Promise<void> {
        // setInterval(async () => {
        //     this.emit<Heading>('heading', (Math.random() - 0.5) * 360);
        // }, 1000);
    }
}
