import { useEffect, useState, FunctionComponent, PropsWithChildren, useCallback } from 'react';
import { Module, Location } from '../../types';
import clsx from 'clsx';
import FooterController from '../../components/FooterController';
import { ArrowPathIcon, ClockIcon } from '@heroicons/react/24/outline';

export const Angle: Module = ({ on, emit }) => {
    const [compass, setCompass] = useState({
        heading: 0,
        // diff: 0,
        rawHeading: 0,
        calibrating: false,
    });

    const [angle, setAngle] = useState({
        roll: 0,
        pitch: 0,
    });

    function recalibrateCompass() {
        console.log('recalibrate');
        setCompass({
            ...compass,
            calibrating: true,
        });
        emit('recalibrateCompass');
    }

    useEffect(() => {
        on('compass', (rawHeading: number) => {
            // const smoothedHeading = shortestRotationAngle(compass.heading, heading);
            setCompass((compass) => {
                let diff = rawHeading - compass.rawHeading;

                if (diff > 180) {
                    diff -= 360;
                } else if (diff < -180) {
                    diff += 360;
                }

                const newHeading = (compass.heading + diff) % 360;
                return {
                    ...compass,
                    // diff,
                    rawHeading,
                    heading: newHeading,
                };
            });
        });

        on('compassCalibrated', () => {
            setCompass({
                ...compass,
                calibrating: false,
            });
        });

        on('orientation', (data: { roll: number; pitch: number }) => {
            setAngle(data);
        });
    }, []);

    return (
        <>
            <FooterController
                icon={
                    <div
                        style={{
                            transform: `rotateX(0deg) rotateY(0deg) rotateZ(${-angle.pitch}deg)`,
                        }}
                        className="h-8 w-16 transition-transform relative border-2 border-white rounded-lg"
                    >
                        <div className="absolute left-8 right-0 top-1/2 mt-[-1px] border-t-[2px] border-white"></div>
                    </div>
                }
                name={
                    <div>
                        <div>{angle.pitch.toFixed(0)}°</div>
                        <div>Pitch</div>
                    </div>
                }
            />

            <FooterController
                icon={
                    <div
                        style={{
                            transform: `rotateX(0deg) rotateY(0deg) rotateZ(${angle.roll}deg)`,
                        }}
                        className="h-8 w-8  transition-transform  relative border-2 border-white rounded-full"
                    >
                        <div className="absolute bottom-4 top-0 left-1/2 ml-[-1px] border-r-[2px] border-white"></div>
                    </div>
                }
                name={
                    <div>
                        <div>{angle.roll.toFixed(0)}°</div>
                        <div>Roll</div>
                    </div>
                }
            />

            <FooterController
                icon={
                    <div className="relative">
                        <div className="absolute cursor-pointer -bottom-3 -right-2 z-10 rounded-full">
                            {!compass.calibrating ? (
                                <ArrowPathIcon onClick={() => recalibrateCompass()} className="w-4" />
                            ) : (
                                <ClockIcon className="w-4" />
                            )}
                        </div>

                        <div
                            className="h-12 w-12 relative z-0 border-2 border-white rounded-full flex justify-center items-center overflow-hidden"
                            style={{
                                perspective: '20rem',
                                background: 'radial-gradient(circle at center, #00000055 50%, #ffffff55 100%)',
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
                                        transform: `rotateX(-45deg) rotateY(0deg) rotateZ(${90 - compass.heading}deg)`,
                                        transformStyle: 'preserve-3d',
                                    }}
                                >
                                    <CompassCardinalPoint offset={0} size={CompassCardinalPointSize.Large}>
                                        N
                                    </CompassCardinalPoint>
                                    <CompassCardinalPoint offset={22.5} size={CompassCardinalPointSize.Small}>
                                        NNE
                                    </CompassCardinalPoint>
                                    <CompassCardinalPoint offset={45} size={CompassCardinalPointSize.Medium}>
                                        NE
                                    </CompassCardinalPoint>
                                    <CompassCardinalPoint offset={67.5} size={CompassCardinalPointSize.Small}>
                                        ENE
                                    </CompassCardinalPoint>
                                    <CompassCardinalPoint offset={90} size={CompassCardinalPointSize.Large}>
                                        E
                                    </CompassCardinalPoint>
                                    <CompassCardinalPoint offset={112.5} size={CompassCardinalPointSize.Small}>
                                        ESE
                                    </CompassCardinalPoint>
                                    <CompassCardinalPoint offset={135} size={CompassCardinalPointSize.Medium}>
                                        SE
                                    </CompassCardinalPoint>
                                    <CompassCardinalPoint offset={157.5} size={CompassCardinalPointSize.Small}>
                                        SSE
                                    </CompassCardinalPoint>
                                    <CompassCardinalPoint offset={180} size={CompassCardinalPointSize.Large}>
                                        S
                                    </CompassCardinalPoint>
                                    <CompassCardinalPoint offset={202.5} size={CompassCardinalPointSize.Small}>
                                        SSW
                                    </CompassCardinalPoint>
                                    <CompassCardinalPoint offset={225} size={CompassCardinalPointSize.Medium}>
                                        SW
                                    </CompassCardinalPoint>
                                    <CompassCardinalPoint offset={247.5} size={CompassCardinalPointSize.Small}>
                                        WSW
                                    </CompassCardinalPoint>
                                    <CompassCardinalPoint offset={270} size={CompassCardinalPointSize.Large}>
                                        W
                                    </CompassCardinalPoint>
                                    <CompassCardinalPoint offset={292.5} size={CompassCardinalPointSize.Small}>
                                        WNW
                                    </CompassCardinalPoint>
                                    <CompassCardinalPoint offset={315} size={CompassCardinalPointSize.Medium}>
                                        NW
                                    </CompassCardinalPoint>
                                    <CompassCardinalPoint offset={337.5} size={CompassCardinalPointSize.Small}>
                                        NNW
                                    </CompassCardinalPoint>
                                </div>
                            </div>
                        </div>
                    </div>
                }
                name={
                    <div>
                        <div>{compass.rawHeading?.toFixed(0)}°</div>
                        <div>Compass</div>
                    </div>
                }
            />
        </>
    );
};

function shortestRotationAngle(currentAngle: number, targetAngle: number) {
    // Normalize the angles to be within the range [0, 360)
    currentAngle = ((currentAngle % 360) + 360) % 360;
    targetAngle = ((targetAngle % 360) + 360) % 360;

    // Calculate the absolute difference between the angles
    let diff = targetAngle - currentAngle;

    // Normalize the difference to be within the range [-180, 180)
    if (diff < -180) {
        diff += 360;
    } else if (diff >= 180) {
        diff -= 360;
    }

    return diff;
}

enum CompassCardinalPointSize {
    Small,
    Medium,
    Large,
}
const CompassCardinalPoint: FunctionComponent<
    PropsWithChildren<{
        offset: number;
        size?: CompassCardinalPointSize;
    }>
> = ({ children, offset, size }) => {
    return (
        <div
            className={clsx('absolute w-0 h-0 flex justify-center items-center origin-center perspective', {
                'text-4xl  font-light font-serif': size == CompassCardinalPointSize.Large,
                'text-2xl  font-normal font-serif': size == CompassCardinalPointSize.Medium,
                'text-xs  font-medium font-serif': size == CompassCardinalPointSize.Small,
            })}
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

Angle.location = Location.BottomLeft;
