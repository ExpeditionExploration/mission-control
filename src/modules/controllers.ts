// The controller should be exported as a namespaced object.
import { StatsModuleController } from './stats/controller';
import { MediaModuleController } from './media/controller';
import { CompassModuleController } from './compass/controller';
import { LightsModuleController } from './lights/controller';

export const controllers = new Map([
    ['stats', StatsModuleController],
    ['media', MediaModuleController],
    ['compass', CompassModuleController],
    ['lights', LightsModuleController],
])