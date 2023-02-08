import React, { useEffect, useState } from "react"
import type Module from "../Module";
import clsx from "clsx";
import { stat } from "fs";

export const Control: Module = {
    right: ({
        send,
        events,
        debug
    }) => {
        const [canDrag, setCanDrag] = useState(false);
        const [canSetMove, setCanSetMove] = useState(false);
        const [move, setMove] = useState({
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

        function dragControl(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) {
            if (canDrag) {
                const target = evt.target as HTMLElement;
                // console.log(evt.nativeEvent.offsetY, target.clientHeight);
                const x = Math.min(Math.max(((evt.nativeEvent.offsetX - target.clientWidth / 2) * 2) / target.clientHeight, -1), 1);
                const y = Math.min(Math.max(((evt.nativeEvent.offsetY - target.clientHeight / 2) * 2) / target.clientHeight, -1), 1);
                setState({
                    ...state,
                    x,
                    y,
                    height: target.clientHeight,
                    width: target.clientWidth
                });
            }
        }

        function toggleDrag(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) {
            setCanDrag(canDrag => !canDrag);
        }

        function toggleSetMove(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) {
            setCanSetMove(canSetMove => !canSetMove);
        }

        function moveSpeedSlider(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) {
            if (canSetMove) {
                const target = evt.target as HTMLElement;
                let percent = evt.nativeEvent.offsetY / target.clientHeight;
                if (isNaN(percent)) percent = 0;
                percent = (percent - 0.2) / (0.8 - 0.2)
                percent = Math.min(Math.max(percent, 0), 1);
                percent = 1 - percent;

                setMove(state => ({ ...state, speed: percent }));
            }
        }

        function keydownListener(event: KeyboardEvent) {
            switch (event.code) {
                case 'KeyW':
                    setMove(state => ({ ...state, direction: 1 }));
                    break;
                case 'KeyS':
                    setMove(state => ({ ...state, direction: -1 }));
                    break;
            }
        }

        function keyupListener(event: KeyboardEvent) {
            switch (event.code) {
                case 'Escape':
                    setCanDrag(false);
                    break;
                case 'ArrowDown':
                    setMove(state => ({
                        ...state,
                        speed: (state.speed - 0.1) > 0 ? state.speed - 0.1 : 0
                    }));
                    break;
                case 'ArrowUp':
                    setMove(state => ({
                        ...state,
                        speed: (state.speed + 0.1) < 1 ? state.speed + 0.1 : 1
                    }));
                    break;
                case 'KeyW':
                    setMove(state => ({ ...state, direction: 0 }));
                    break;
                case 'KeyS':
                    setMove(state => ({ ...state, direction: 0 }));
                    break;
            }
        }

        useEffect(() => {
            window.addEventListener('keydown', keydownListener);
            window.addEventListener('keyup', keyupListener);
            return () => {
                window.removeEventListener('keydown', keydownListener);
                window.removeEventListener('keyup', keyupListener);
            }
        }, []);

        useEffect(() => {
            send({
                left: Math.round(state.y * 90),
                right: Math.round(state.x * 90),
            }, 'setTurn');
        }, [state])

        useEffect(() => {
            const speed = Math.trunc(move.speed * move.direction * 100);
            send({
                left: speed,
                right: speed,
            }, 'setMotors');
        }, [move])

        useEffect(() => {
            if (!canDrag) {
                setState(state => ({ ...state, x: 0, y: 0 }));
            }
        }, [canDrag])

        // Sets the min gradient ramp start size to 25%
        const speedRamp = (move.speed * 0.9 + 0.1) * 100;

        return (
            <>
                <div
                    className={clsx('space-y-2 opacity-100 transition-opacity', {
                        '!opacity-0': canDrag,
                    })}>
                    <div
                        className='h-16 flex justify-center items-center'>
                        <div
                            onClick={evt => toggleSetMove(evt)}
                            onMouseMove={evt => moveSpeedSlider(evt)}
                            className="relative w-6 h-12 flex justify-center">
                            <div className='pointer-events-none h-full w-0 relative border-0 border-l-2 border-white'></div>
                            <div style={{
                                top: `${(1 - move.speed) * 100}%`,
                            }} className='pointer-events-none absolute h-0 w-full border-t-2 border-white'></div>
                        </div>
                    </div>
                    <div className='text-xs'>Speed</div>
                </div>
                <div className='space-y-2'>
                    <div className={clsx('h-16 flex justify-center items-center relative', {
                        'cursor-move': move.direction,
                        'cursor-pointer': !move.direction,
                    })}>
                        <div
                            onClick={(evt) => toggleDrag(evt)}
                            onMouseMove={(evt) => dragControl(evt)}
                            style={{
                                background: clsx({
                                    [`radial-gradient(circle at center, #ffffff44 0, #ffffff00 ${speedRamp}%)`]: move.direction == 0,
                                    [`radial-gradient(circle at center, #00aa00ff 0, #ffffff00 ${speedRamp}%)`]: move.direction > 0,
                                    // [`radial-gradient(circle at center, #4444ffff 0, #ffffff00 ${speedRamp}%)`]: move.direction > 0,
                                    [`radial-gradient(circle at center, #ff0000ff 0, #ffffff00 ${speedRamp}%)`]: move.direction < 0,
                                    // [`radial-gradient(circle at center, #ff0000ff 0, #ffffff00 ${speedRamp}%)`]: move.direction < 0,
                                })
                            }}
                            className={clsx('z-10 h-12 w-12 transition-all flex justify-center items-center relative border-2 border-white rounded-full', {
                                'scale-[2.5] !border-[1px]': canDrag
                            })}>
                            <div
                                style={{
                                    transform: `translate3d(${state.x * state.width / 2}px, ${state.y * state.height / 2}px, 0)`,
                                }}
                                className='transition-transform duration-75 ease-in shrink-0 pointer-events-none h-1.5 w-1.5 rounded-full bg-white'></div>
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