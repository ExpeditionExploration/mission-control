// The controller should be exported as a namespaced object.
import { StatsModuleView } from './stats/view';
import { MediaModuleView } from './media/view';
import { CompassModuleView } from './compass/view';
import { AngleModuleView } from './angle/view';
import { LightsModuleView } from './lights/view';


export const views = new Map([
    ['stats', StatsModuleView],
    ['media', MediaModuleView],
    ['compass', CompassModuleView],
    ['angle', AngleModuleView],
    ['lights', LightsModuleView],
])