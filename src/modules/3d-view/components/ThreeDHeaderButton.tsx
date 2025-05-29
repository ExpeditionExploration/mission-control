// import { useEvents } from 'src/client/hooks';
import { ViewProps } from 'src/client/user-interface';
import { type ThreeDViewModuleClient } from '../client';
import { Box } from 'lucide-react';

export const ThreeDHeaderButton: React.FC<
    ViewProps<ThreeDViewModuleClient>
> = ({ module }) => {
    return (
        <div
            onClick={() => {
                const windowUrl = import.meta.env.DEV
                    ? '/src/modules/3d-view/window/index.html'
                    : '/3d-view.html'; // Built filename

                window.open(windowUrl, '_blank', 'width=800,height=600');
            }}
            className="rounded-full w-14 h-14 flex border-2 border-white justify-center items-center transition-colors cursor-pointer hover:bg-emerald-600"
        >
            <Box className="size-6" />
        </div>
    );
};
