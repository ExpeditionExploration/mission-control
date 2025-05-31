// import { useEvents } from 'src/client/hooks';
import { ViewProps } from 'src/client/user-interface';
import { type SpatialModuleClient } from '../client';
import { Box } from 'lucide-react';

export const SpatialHeaderButton: React.FC<
    ViewProps<SpatialModuleClient>
> = ({ module }) => {
    return (
        <div
            onClick={() => {
                if(module.window) {
                    module.window.focus();
                    return;
                }

                const windowUrl = import.meta.env.DEV
                    ? '/src/modules/spatial/window/index.html'
                    : '/spatial.html'; // Built filename

                const spatialWindow = window.open(windowUrl, '_blank', 'width=800,height=600');
                console.log('Opening spatial window', {
                    windowUrl,
                    spatialWindow,      
                });
                module.captureSpatialWindow(spatialWindow);
            }}
            className="rounded-full w-14 h-14 flex border-2 border-white justify-center items-center transition-colors cursor-pointer hover:bg-emerald-600"
        >
            <Box className="size-6" />
        </div>
    );
};
