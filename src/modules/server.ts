// The controller should be exported as a namespaced object.
import { StatsModuleServer } from './stats/server';
import { MediaModuleServer } from './media/server';
import { LightsModuleServer } from './lights/server';
import { ControlModuleServer } from './control/server';

export const modules = new Map([
    ['stats', StatsModuleServer],
    ['media', MediaModuleServer],
    ['lights', LightsModuleServer],
    ['control', ControlModuleServer],
])