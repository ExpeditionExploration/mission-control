// import { useEvents } from 'src/client/hooks';
import { ViewProps } from 'src/client/user-interface';
import { type AngleModuleClient } from '../client';
import { useEffect, useState } from 'react';
import { cn } from 'src/client/utility';
import { Speed } from './types'
import { Payload } from 'src/connection';

export const SpeedoMeterFooterItem: React.FC<ViewProps<AngleModuleClient>> = ({
    module,
}) => {
    const [speed, setSpeed] = useState<number>(0);

    useEffect(() => {
        module.broadcaster.on('imu:speed', (speed: Payload) => {
            // Calculate absolute speed from its components
            const absSpeed = Math.sqrt(
                speed.data.x ** 2 + speed.data.y ** 2 + speed.data.z ** 2);
            setSpeed(absSpeed);
        });
    }, []);

    const getSize = (n: number): CompassCardinalPointSize => {
        if (n % 2 === 0) return CompassCardinalPointSize.Large;
        if (n + 1 % 5 === 0) return CompassCardinalPointSize.Medium;
        return CompassCardinalPointSize.Small;
    }

    return (
        <div className="relative flex w-14 hh-14 items-end justify-center">
            <div className="text-xs font-bold text-center relative z-10 bg-black/80 px-2 py-1 rounded-full w-12 -mb-4">
                {speed.toFixed(1)}
                <sup>m</sup>⁄<sub>s</sub>
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
                            transform: `rotateX(-45deg) rotateY(0deg) rotateZ(${90 - speed * (360 / 14)
                                }deg)`,
                            transformStyle: 'preserve-3d',
                        }}
                    >
                        {Array.from({ length: 14 }, (_, i) => (
                            <SpeedoMeterCardinalPoint
                                offset={i * (360 / 29)}
                                size={getSize(i)}
                                key={i}
                            >{i / 2}</SpeedoMeterCardinalPoint>))}

                    </div>
                </div>
            </div>
        </div >
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
const SpeedoMeterCardinalPoint: React.FC<CompassCardinalPointProps> = ({
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
