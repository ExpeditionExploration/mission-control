// import { useEvents } from 'src/client/hooks';
import { ViewProps } from 'src/client/user-interface';
import { type MediaModuleClient } from '../client';
import { Camera } from 'lucide-react';

export const TakePictureButton: React.FC<ViewProps<MediaModuleClient>> = () => {
    return (
        <div className="rounded-full w-14 h-14 flex border-2 border-white justify-center items-center transition-colors cursor-pointer hover:bg-slate-500">
            <Camera />
        </div>
    );
};
