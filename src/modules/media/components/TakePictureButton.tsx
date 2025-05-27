// import { useEvents } from 'src/client/hooks';
import { ViewProps } from 'src/client/user-interface';
import { type MediaModuleClient } from '../client';
import { Camera } from 'lucide-react';
import { useEffect } from 'react';

export const TakePictureButton: React.FC<ViewProps<MediaModuleClient>> = ({
    module,
}) => {
    useEffect(() => {
        module.on<{ data: string }>('pictureTaken', ({ data }) => {
            // Download base64 image data via Blob

            const blob = new Blob(
                [Uint8Array.from(atob(data), (c) => c.charCodeAt(0))],
                { type: 'image/png' },
            );
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `mission-control-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
    }, [module]);
    return (
        <div
            onClick={() => {
                module.emit('takePicture', {});
            }}
            className="rounded-full w-14 h-14 flex border-2 border-white justify-center items-center transition-colors cursor-pointer hover:bg-slate-500"
        >
            <Camera />
        </div>
    );
};
