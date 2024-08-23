// The controller should be exported as a namespaced object.
import { StatsModuleClient } from './stats/client';
import { MediaModuleClient } from './media/client';
import { AngleModuleClient } from './angle/client';
import { ControlModuleClient } from './control/client';


export const modules = new Map([
    ['stats', StatsModuleClient],
    ['media', MediaModuleClient],
    ['angle', AngleModuleClient],
    ['control', ControlModuleClient],
])