// import { useEvents } from 'src/client/hooks';
import { ViewProps } from 'src/client/user-interface';
import { type AngleModuleClient } from '../client';
import { useEffect, useState } from 'react';
import { cn } from 'src/client/utility';
import { Heading } from '../types';

export const CompassFooterItem: React.FC<ViewProps<AngleModuleClient>> = ({
    module,
}) => {
    const [heading, setHeading] = useState<Heading>(0);
    
    useEffect(() => {
        module.on<Heading>('heading', (heading) => {
            setHeading(heading);
        });
    }, []);

    return (
        <div className="relative flex w-14 hh-14 items-end justify-center">
            <div className="text-xs font-bold text-center relative z-10 bg-black/80 px-2 py-1 rounded-full w-12 -mb-4">
                {heading.toFixed(0)}°
            </div>
            <div
                className="aspect-square w-full absolute z-0 bottom-0 border-2 border-white rounded-full flex justify-center items-center overflow-hidden"
                style={{
                    perspective: '20rem',
                    background:
                        'radial-gradient(circle at center, #00000055 50%, #ffffff55 100%)',
                }}
            >
                <div
                    style={{
                        transform: `translateY(4.25rem) translateZ(-8rem)`, // Change Z to move the compass letters closer or further away
                        transformStyle: 'preserve-3d',
                    }}
                >
                    <div
                        className="relative w-0 h-0 transition-transform"
                        style={{
                            transform: `rotateX(-45deg) rotateY(0deg) rotateZ(${
                                90 - heading
                            }deg)`,
                            transformStyle: 'preserve-3d',
                        }}
                    >
                        <CompassCardinalPoint
                            offset={0}
                            size={CompassCardinalPointSize.Large}
                        >
                            N
                        </CompassCardinalPoint>
                        <CompassCardinalPoint
                            offset={22.5}
                            size={CompassCardinalPointSize.Small}
                        >
                            NNE
                        </CompassCardinalPoint>
                        <CompassCardinalPoint
                            offset={45}
                            size={CompassCardinalPointSize.Medium}
                        >
                            NE
                        </CompassCardinalPoint>
                        <CompassCardinalPoint
                            offset={67.5}
                            size={CompassCardinalPointSize.Small}
                        >
                            ENE
                        </CompassCardinalPoint>
                        <CompassCardinalPoint
                            offset={90}
                            size={CompassCardinalPointSize.Large}
                        >
                            E
                        </CompassCardinalPoint>
                        <CompassCardinalPoint
                            offset={112.5}
                            size={CompassCardinalPointSize.Small}
                        >
                            ESE
                        </CompassCardinalPoint>
                        <CompassCardinalPoint
                            offset={135}
                            size={CompassCardinalPointSize.Medium}
                        >
                            SE
                        </CompassCardinalPoint>
                        <CompassCardinalPoint
                            offset={157.5}
                            size={CompassCardinalPointSize.Small}
                        >
                            SSE
                        </CompassCardinalPoint>
                        <CompassCardinalPoint
                            offset={180}
                            size={CompassCardinalPointSize.Large}
                        >
                            S
                        </CompassCardinalPoint>
                        <CompassCardinalPoint
                            offset={202.5}
                            size={CompassCardinalPointSize.Small}
                        >
                            SSW
                        </CompassCardinalPoint>
                        <CompassCardinalPoint
                            offset={225}
                            size={CompassCardinalPointSize.Medium}
                        >
                            SW
                        </CompassCardinalPoint>
                        <CompassCardinalPoint
                            offset={247.5}
                            size={CompassCardinalPointSize.Small}
                        >
                            WSW
                        </CompassCardinalPoint>
                        <CompassCardinalPoint
                            offset={270}
                            size={CompassCardinalPointSize.Large}
                        >
                            W
                        </CompassCardinalPoint>
                        <CompassCardinalPoint
                            offset={292.5}
                            size={CompassCardinalPointSize.Small}
                        >
                            WNW
                        </CompassCardinalPoint>
                        <CompassCardinalPoint
                            offset={315}
                            size={CompassCardinalPointSize.Medium}
                        >
                            NW
                        </CompassCardinalPoint>
                        <CompassCardinalPoint
                            offset={337.5}
                            size={CompassCardinalPointSize.Small}
                        >
                            NNW
                        </CompassCardinalPoint>
                    </div>
                </div>
            </div>
        </div>
    );
};

enum CompassCardinalPointSize {
    Small,
    Medium,
    Large,
}
interface CompassCardinalPointProps extends React.HTMLProps<HTMLDivElement> {
    size: CompassCardinalPointSize;
    offset: number;
}
const CompassCardinalPoint: React.FC<CompassCardinalPointProps> = ({
    children,
    size,
    offset,
}) => {
    return (
        <div
            className={cn(
                'absolute w-0 h-0 flex justify-center items-center origin-center perspective',
                {
                    'text-4xl text-white  font-light font-serif':
                        size == CompassCardinalPointSize.Large,
                    'text-2xl text-gray-200 font-normal font-serif':
                        size == CompassCardinalPointSize.Medium,
                    'text-[0.6rem] text-gray-500 font-medium font-serif':
                        size == CompassCardinalPointSize.Small,
                },
            )}
            style={{
                transform: `rotateZ(${offset}deg) translateX(-6rem) translateZ(0)`,
                transformStyle: 'preserve-3d',
            }}
        >
            <div
                style={{
                    transform: `rotateX(0) rotateY(-45deg) rotateZ(-90deg)`,
                }}
            >
                {children}
            </div>
        </div>
    );
};
