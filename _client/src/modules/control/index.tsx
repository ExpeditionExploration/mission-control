import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Location, type Module } from '../../types';
import clsx from 'clsx';
import { stat } from 'fs';

function clamp(num: number, min: number, max: number) {
    return Math.min(Math.max(num, min), max);
}

// function round5(x: number) {
//     return Math.ceil(x / 5) * 5;
// }

export const Control: Module = ({ emit }) => {
    const [canDrag, setCanDrag] = useState(false);
    const [canSetMove, setCanSetMove] = useState(false);
    const controlRef = useRef<HTMLDivElement>(null);
    const [thrusters, setThrusters] = useState({
        speed: 1,
        left: 0,
        right: 0,
        // direction: 0,
    });
    // const [canSetMove, setCanSetMove] = useState(false);
    // TODO Convert x and y into rotational coordinates for the thrusters
    const [state, setState] = useState({
        x: 0,
        y: 0,
        height: 0,
        width: 0,
    });

    const dragControl = useCallback((evt: MouseEvent) => {
        const target = controlRef.current as HTMLElement;
        // const target = evt.target as HTMLElement;

        const rect = target.getBoundingClientRect();
        const center = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
        const vec = {
            x: (evt.x - center.x) / (rect.width / 2),
            y: (evt.y - center.y) / (rect.height / 2),
        };
        const length = Math.sqrt(vec.x * vec.x + vec.y * vec.y);

        // normalize 2d vector vec
        const norm = { x: vec.x / length, y: vec.y / length };
        const clampedLength = clamp(length, 0, 1);
        const scaled = { x: norm.x * clampedLength, y: norm.y * clampedLength };

        setState((state) => ({
            width: target.clientWidth,
            height: target.clientHeight,
            x: scaled.x,
            y: scaled.y,
        }));
    }, []);

    const toggleDrag = useCallback((evt: React.MouseEvent<HTMLDivElement, MouseEvent> | MouseEvent) => {
        evt.stopPropagation();
        setCanDrag((canDrag) => !canDrag);
    }, []);

    const toggleSetMove = useCallback((evt: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        setCanSetMove((canSetMove) => !canSetMove);
    }, []);

    const thrustersSpeedSlider = useCallback(
        (evt: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            if (canSetMove) {
                const target = evt.target as HTMLElement;
                let percent = evt.nativeEvent.offsetY / target.clientHeight;
                if (isNaN(percent)) percent = 0;
                percent = (percent - 0.1) / (0.9 - 0.1);
                percent = clamp(percent, 0, 1);
                percent = 1 - percent;

                setThrusters((state) => ({ ...state, speed: percent }));
            }
        },
        [canSetMove]
    );

    const keydownListener = useCallback((event: KeyboardEvent) => {
        switch (event.code) {
            case 'KeyW':
                setThrusters((state) => ({ ...state, left: 1, right: 1 }));
                break;
            case 'KeyS':
                setThrusters((state) => ({ ...state, left: -1, right: -1 }));
                break;
            case 'KeyA':
                setThrusters((state) => ({ ...state, left: -1, right: 1 }));
                break;
            case 'KeyD':
                setThrusters((state) => ({ ...state, left: 1, right: -1 }));
                break;
        }
    }, []);

    const keyupListener = useCallback((event: KeyboardEvent) => {
        switch (event.code) {
            case 'Escape':
                setCanDrag(false);
                break;
            case 'ArrowDown':
                setThrusters((state) => ({
                    ...state,
                    speed: state.speed - 0.1 > 0 ? state.speed - 0.1 : 0,
                }));
                break;
            case 'ArrowUp':
                setThrusters((state) => ({
                    ...state,
                    speed: state.speed + 0.1 < 1 ? state.speed + 0.1 : 1,
                }));
                break;
            case 'KeyW':
            case 'KeyS':
            case 'KeyA':
            case 'KeyD':
                setThrusters((state) => ({ ...state, left: 0, right: 0 }));
                break;
        }
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', keydownListener);
        window.addEventListener('keyup', keyupListener);
        return () => {
            window.removeEventListener('keydown', keydownListener);
            window.removeEventListener('keyup', keyupListener);
        };
    }, []);

    useEffect(() => {
        const ailerons = {
            left: clamp(state.y + state.x * (state.x > 0 ? -1 : 1), -1, 1),
            right: clamp(state.y + state.x * (state.x > 0 ? 1 : -1), -1, 1),
        };

        emit('setAilerons', ailerons);
    }, [state]);

    useEffect(() => {
        emit('setThrusters', {
            left: clamp(thrusters.speed * thrusters.left, -1, 1),
            right: clamp(thrusters.speed * thrusters.right, -1, 1),
        });
    }, [thrusters]);

    useEffect(() => {
        if (canDrag) {
            window.addEventListener('mousemove', dragControl);
            window.addEventListener('click', toggleDrag);
        }

        return () => {
            setState((state) => ({ ...state, x: 0, y: 0 }));
            window.removeEventListener('mousemove', dragControl);
            window.removeEventListener('click', toggleDrag);
        };
    }, [canDrag]);

    // Sets the min gradient ramp start size to 25%
    const speedRamp = (thrusters.speed * 0.9 + 0.1) * 100;

    return (
        <>
            <div
                onMouseDown={(evt) => setCanSetMove(true)}
                onMouseUp={(evt) => setCanSetMove(false)}
                onMouseLeave={(evt) => setCanSetMove(false)}
                className={clsx('space-y-2 opacity-100 transition-opacity', {
                    '!opacity-0 pointer-events-none': canDrag,
                })}
            >
                <div
                    onMouseMove={(evt) => thrustersSpeedSlider(evt)}
                    className="h-16 flex justify-center items-center cursor-move"
                >
                    <div className="relative w-6 h-12 flex justify-center">
                        <div className="pointer-events-none h-full w-0 relative border-0 border-l-2 border-white"></div>
                        <div
                            style={{
                                top: `${(1 - thrusters.speed) * 100}%`,
                            }}
                            className="pointer-events-none absolute h-0 w-full border-t-2 border-white"
                        ></div>
                    </div>
                </div>
                <div className="text-xs">Speed</div>
            </div>
            <div className="space-y-2">
                <div className={clsx('h-16 flex justify-center items-center relative cursor-pointer')}>
                    <div
                        ref={controlRef}
                        onClick={(evt) => toggleDrag(evt)}
                        // onMouseMove={(evt) => dragControl(evt)}
                        style={{
                            background: clsx({
                                // Stop
                                [`radial-gradient(circle at center, #ffffff44 0, #ffffff00 ${speedRamp}%)`]:
                                    thrusters.left == 0 && thrusters.right == 0,
                                // Forwards
                                [`radial-gradient(circle at center, #00aa00ff 0, #ffffff00 ${speedRamp}%)`]:
                                    thrusters.left > 0 && thrusters.right > 0,
                                // Backwards
                                [`radial-gradient(circle at center, #ff0000ff 0, #ffffff00 ${speedRamp}%)`]:
                                    thrusters.left < 0 && thrusters.right < 0,
                                // Left
                                [`radial-gradient(circle at center, #0077ffff 0, #ffffff00 ${speedRamp}%)`]:
                                    thrusters.left < 0 && thrusters.right > 0,
                                // Right
                                [`radial-gradient(circle at center, #ff7700ff 0, #ffffff00 ${speedRamp}%)`]:
                                    thrusters.left > 0 && thrusters.right < 0,
                                // [`radial-gradient(circle at center, #ff0000ff 0, #ffffff00 ${speedRamp}%)`]: thrusters.direction < 0,
                            }),
                        }}
                        className={clsx(
                            'z-10 h-12 w-12 transition-all origin-bottom-right flex justify-center items-center relative border-2 border-white rounded-full',
                            {
                                'scale-[2.5] !border-[1px]': canDrag,
                            }
                        )}
                    >
                        <div
                            style={{
                                transform: `translate3d(${(state.x * state.width) / 2}px, ${
                                    (state.y * state.height) / 2
                                }px, 0)`,
                            }}
                            className="transition-transform duration-[50ms] ease-in shrink-0 pointer-events-none h-1.5 w-1.5 rounded-full bg-white"
                        ></div>
                    </div>
                </div>
                <div
                    className={clsx('text-xs opacity-100 transition-opacity', {
                        '!opacity-0': canDrag,
                    })}
                >
                    Control
                </div>
            </div>
        </>
    );
};

Control.location = Location.BottomRight;
