import { Module } from 'src/module';
import { Location } from '../location/types';

export class SpatialModuleServer extends Module {

    onModuleInit(): void | Promise<void> {
        this.broadcaster.on('location:location', (payload: { data: Location }) => {
            const location = payload.data;
            this.emit<Location>('location', location);
        });
    }
}
