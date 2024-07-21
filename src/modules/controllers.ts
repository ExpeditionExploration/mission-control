// The controller should be exported as a namespaced object.
import { StatsModuleController } from './stats/controller';
import { MediaModuleController } from './media/controller';
import { LightsModuleController } from './lights/controller';
import { ControlModuleController } from './control/controller';
// import { AngleModuleController } from './angle/controller';

export const controllers = new Map([
    ['stats', StatsModuleController],
    ['media', MediaModuleController],
    ['lights', LightsModuleController],
    ['control', ControlModuleController],
    // ['angle', AngleModuleController],
])