import React, { useEffect, useState, useRef, useCallback } from "react"
import type Module from "../../types";
import clsx from "clsx";
import { stat } from "fs";

function clamp(num: number, min: number, max: number) {
    return Math.min(Math.max(num, min), max);
}

function round5(x: number) {
    return Math.ceil(x / 5) * 5;
}

export const Control: Module = {
    right: ({
        send,
        events,
        debug
    }) => {
        const [canDrag, setCanDrag] = useState(false);
        const [canSetMove, setCanSetMove] = useState(false);
        const controlRef = useRef<HTMLDivElement>(null);
        const [motors, setMotors] = useState({
            speed: 1,
            direction: 0
        });
        // const [canSetMove, setCanSetMove] = useState(false);
        // TODO Convert x and y into rotational coordinates for the motors
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
                y: (evt.y - center.y) / (rect.height / 2)
            };
            const length = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
            // console.log(length),
            // normalize 2d vector vec
            const norm = { x: vec.x / length, y: vec.y / length };
            const clampedLength = clamp(length, 0, 1);
            const scaled = { x: norm.x * clampedLength, y: norm.y * clampedLength };
            // console.log(scaled);
            setState(state => ({
                width: target.clientWidth,
                height: target.clientHeight,
                x: scaled.x,
                y: scaled.y
            }));
        }, [])

        const toggleDrag = useCallback((evt: React.MouseEvent<HTMLDivElement, MouseEvent> | MouseEvent) => {
            setCanDrag(canDrag => !canDrag);
        }, [])

        const toggleSetMove = useCallback((evt: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            setCanSetMove(canSetMove => !canSetMove);
        }, [])

        const motorsSpeedSlider = useCallback((evt: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            if (canSetMove) {
                const target = evt.target as HTMLElement;
                let percent = evt.nativeEvent.offsetY / target.clientHeight;
                if (isNaN(percent)) percent = 0;
                percent = (percent - 0.2) / (0.8 - 0.2)
                percent = clamp(percent, 0, 1);
                percent = 1 - percent;

                setMotors(state => ({ ...state, speed: percent }));
            }
        }, [canSetMove]);

        const keydownListener = useCallback((event: KeyboardEvent) => {
            switch (event.code) {
                case 'KeyW':
                    setMotors(state => ({ ...state, direction: 1 }));
                    break;
                case 'KeyS':
                    setMotors(state => ({ ...state, direction: -1 }));
                    break;
            }
        }, []);

        const keyupListener = useCallback((event: KeyboardEvent) => {
            switch (event.code) {
                case 'Escape':
                    setCanDrag(false);
                    break;
                case 'ArrowDown':
                    setMotors(state => ({
                        ...state,
                        speed: (state.speed - 0.1) > 0 ? state.speed - 0.1 : 0
                    }));
                    break;
                case 'ArrowUp':
                    setMotors(state => ({
                        ...state,
                        speed: (state.speed + 0.1) < 1 ? state.speed + 0.1 : 1
                    }));
                    break;
                case 'KeyW':
                    setMotors(state => ({ ...state, direction: 0 }));
                    break;
                case 'KeyS':
                    setMotors(state => ({ ...state, direction: 0 }));
                    break;
            }
        }, []);

        useEffect(() => {
            window.addEventListener('keydown', keydownListener);
            window.addEventListener('keyup', keyupListener);
            return () => {
                window.removeEventListener('keydown', keydownListener);
                window.removeEventListener('keyup', keyupListener);
            }
        }, []);

        useEffect(() => {
            const rudders = {
                left: round5(clamp(state.y + (state.x * (state.x > 0 ? -1 : 1)), -1, 1) * 90),
                right: round5(clamp(state.y + (state.x * (state.x > 0 ? 1 : -1)), -1, 1) * 90),
            }

            send(rudders, 'setRudders');
        }, [state])

        useEffect(() => {
            const speed = Math.trunc(motors.speed * motors.direction * 100);
            send({
                left: speed,
                right: speed,
            }, 'setMotors');
        }, [motors])

        useEffect(() => {
            if (canDrag) {
                window.addEventListener('mousemove', dragControl);
                window.addEventListener('mouseup', toggleDrag);
            } else {
                setState(state => ({ ...state, x: 0, y: 0 }));
                window.removeEventListener('mousemove', dragControl);
                window.removeEventListener('mouseup', toggleDrag);
            }
            return () => {
                window.removeEventListener('mousemove', dragControl);
                window.removeEventListener('mouseup', toggleDrag);
            }
        }, [canDrag])

        // Sets the min gradient ramp start size to 25%
        const speedRamp = (motors.speed * 0.9 + 0.1) * 100;

        return (
            <>
                <div
                    className={clsx('space-y-2 opacity-100 transition-opacity', {
                        '!opacity-0 pointer-events-none': canDrag,
                    })}>
                    <div
                        className='h-16 flex justify-center items-center'>
                        <div
                            onClick={evt => toggleSetMove(evt)}
                            onMouseMove={evt => motorsSpeedSlider(evt)}
                            onMouseLeave={evt => setCanSetMove(false)}
                            className="relative w-6 h-12 flex justify-center">
                            <div className='pointer-events-none h-full w-0 relative border-0 border-l-2 border-white'></div>
                            <div style={{
                                top: `${(1 - motors.speed) * 100}%`,
                            }} className='pointer-events-none absolute h-0 w-full border-t-2 border-white'></div>
                        </div>
                    </div>
                    <div className='text-xs'>Speed</div>
                </div>
                <div className='space-y-2'>
                    <div className={clsx('h-16 flex justify-center items-center relative', {
                        'cursor-motors': motors.direction,
                        'cursor-pointer': !motors.direction,
                    })}>
                        <div
                            ref={controlRef}
                            onClick={(evt) => toggleDrag(evt)}
                            // onMouseMove={(evt) => dragControl(evt)}
                            style={{
                                background: clsx({
                                    [`radial-gradient(circle at center, #ffffff44 0, #ffffff00 ${speedRamp}%)`]: motors.direction == 0,
                                    [`radial-gradient(circle at center, #00aa00ff 0, #ffffff00 ${speedRamp}%)`]: motors.direction > 0,
                                    // [`radial-gradient(circle at center, #4444ffff 0, #ffffff00 ${speedRamp}%)`]: motors.direction > 0,
                                    [`radial-gradient(circle at center, #ff0000ff 0, #ffffff00 ${speedRamp}%)`]: motors.direction < 0,
                                    // [`radial-gradient(circle at center, #ff0000ff 0, #ffffff00 ${speedRamp}%)`]: motors.direction < 0,
                                })
                            }}
                            className={clsx('z-10 h-12 w-12 transition-all origin-bottom-right flex justify-center items-center relative border-2 border-white rounded-full', {
                                'scale-[2.5] !border-[1px]': canDrag
                            })}>
                            <div
                                style={{
                                    transform: `translate3d(${state.x * state.width / 2}px, ${state.y * state.height / 2}px, 0)`,
                                }}
                                className='transition-transform duration-[50ms] ease-in shrink-0 pointer-events-none h-1.5 w-1.5 rounded-full bg-white'></div>
                        </div>
                    </div>
                    <div className={clsx('text-xs opacity-100 transition-opacity', {
                        '!opacity-0': canDrag
                    })}>Control</div>
                </div>

            </>
        )
    }
}