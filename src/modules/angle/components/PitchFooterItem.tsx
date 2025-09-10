// import { useEvents } from 'src/client/hooks';
import { ViewProps } from 'src/client/user-interface';
import { type AngleModuleClient } from '../client';
import { useEffect, useState } from 'react';
import { Pitch } from './types'

export const PitchFooterItem: React.FC<ViewProps<AngleModuleClient>> = ({
    module,
}) => {

    const [pitch, setPitch] = useState<number>(0);
    useEffect(() => {
        module.on<Pitch>('pitch', (pitch) => {
            setPitch(pitch);
        });
    }, []);

    return (
        <div className="relative flex w-14 h-14 justify-center items-end">
            <div className="text-xs font-bold text-center relative z-10 bg-black/80 px-2 py-1 rounded-full w-12 -mb-4">
                {pitch.toFixed(0)}°
            </div>
            <div
                style={{
                    transform: `rotateX(0deg) rotateY(0deg) rotateZ(${-pitch}deg) translateY(50%)`,
                }}
                className="w-full aspect-video absolute bottom-1/2 origin-bottom transition-transform border-2 border-white rounded-lg"
            >
                <div className="absolute left-1/2 right-0 top-1/2 mt-[-1px] border-t-[2px] border-white"></div>
            </div>
        </div>
    );
};
