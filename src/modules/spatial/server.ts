import { Module } from 'src/module';

export class SpatialModuleServer extends Module {
    onModuleInit(): void | Promise<void> {
        setInterval(() => {
            this.emit('status', {
                data: 'Spatial module is running on server',
            });
        }, 1000); // Emit status every 1 second
    }
}
