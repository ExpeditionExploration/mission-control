// The controller should be exported as a namespaced object.
import { StatsModuleServer } from './stats/server';
import { MediaModuleServer } from './media/server';
import { LightsModuleServer } from './lights/server';
import { ControlModuleServer } from './control/server';
import { AngleModuleServer } from './angle/server';
import { SpatialModuleServer } from './spatial/server';

export const modules = new Map([
    ['stats', StatsModuleServer],
    ['media', MediaModuleServer],
    ['lights', LightsModuleServer],
    ['control', ControlModuleServer],
    ['angle', AngleModuleServer],
    ['spatial', SpatialModuleServer],
]);
