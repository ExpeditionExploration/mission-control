import React, { useEffect, useState } from "react"
import type Module from "../Module";
import clsx from "clsx";
export const Control: Module = {
    right: ({
        send,
        events
    }) => {
        const [canDrag, setCanDrag] = useState(false);
        const [canSetSpeed, setCanSetSpeed] = useState(false);
        // const [canSetSpeed, setCanSetSpeed] = useState(false);
        // TODO Convert x and y into rotational coordinates for the motors
        const [state, setState] = useState({
            x: 0,
            y: 0,
            move: 0,
            speed: 1
        });

        function dragControl(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) {
            if (canDrag) {
                const target = evt.target as HTMLElement;
                console.log(evt.nativeEvent.offsetY, target.clientHeight)
                setState({
                    ...state,
                    x: (evt.nativeEvent.offsetX - target.clientWidth / 2) * 2,
                    y: (evt.nativeEvent.offsetY - target.clientHeight / 2) * 2,
                });
            }
        }

        function toggleDrag(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) {
            setCanDrag(canDrag => !canDrag);
        }

        function toggleSetSpeed(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) {
            setCanSetSpeed(canSetSpeed => !canSetSpeed);
        }

        function setSpeed(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) {
            if (canSetSpeed) {
                const target = evt.target as HTMLElement;
                let percent = evt.nativeEvent.offsetY / target.clientHeight;
                if (isNaN(percent)) percent = 0;
                percent = (percent - 0.2) / (0.8 - 0.2)
                percent = Math.min(Math.max(percent, 0), 1);
                percent = 1 - percent;

                setState({ ...state, speed: percent });
            }
        }
        function startMove(direction: number) {
            setState(state => ({ ...state, move: direction > 0 ? 1 : -1 }));
        }

        function stopMove() {
            setState(state => ({ ...state, move: 0 }));
        }

        function keydownListener(event: KeyboardEvent) {
            switch (event.code) {
                case 'KeyW':
                    startMove(1);
                    break;
                case 'KeyS':
                    startMove(-1);
                    break;
            }
        }

        function keyupListener(event: KeyboardEvent) {
            switch (event.code) {
                case 'ArrowDown':
                    setState(state => ({
                        ...state,
                        speed: (state.speed - 0.1) > 0 ? state.speed - 0.1 : 0
                    }));
                    break;
                case 'ArrowUp':
                    setState(state => ({
                        ...state,
                        speed: (state.speed + 0.1) < 1 ? state.speed + 0.1 : 1
                    }));
                    break;
                case 'KeyW':
                    stopMove();
                    break;
                case 'KeyS':
                    stopMove();
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
            send(state);
        }, [state])

        const speedRamp = (state.speed * 0.75 + 0.25) * 100;

        return (
            <>
                <div
                    className={clsx('space-y-2 opacity-100 transition-opacity', {
                        '!opacity-0': canDrag,
                    })}>
                    <div
                        className='h-16 flex justify-center items-center'>
                        <div
                            onClick={evt => toggleSetSpeed(evt)}
                            onMouseMove={evt => setSpeed(evt)}
                            className="relative w-6 h-12 flex justify-center">
                            <div className='pointer-events-none h-full w-0 relative border-0 border-l-2 border-white'></div>
                            <div style={{
                                top: `${(1 - state.speed) * 100}%`,
                            }} className='pointer-events-none absolute h-0 w-full border-t-2 border-white'></div>
                        </div>
                    </div>
                    <div className='text-xs'>Speed</div>
                </div>
                <div className='space-y-2'>
                    <div className={clsx('h-16 flex justify-center items-center relative', {
                        'cursor-move': state.move,
                        'cursor-pointer': !state.move,
                    })}>
                        <div
                            onClick={(evt) => toggleDrag(evt)}
                            onMouseMove={(evt) => dragControl(evt)}
                            style={{
                                background: clsx({
                                    [`radial-gradient(circle at center, #ffffff44 0, #ffffff00 ${speedRamp}%)`]: state.move == 0,
                                    [`radial-gradient(circle at center, #4444ffff 0, #ffffff00 ${speedRamp}%)`]: state.move > 0,
                                    [`radial-gradient(circle at center, #ff0000ff 0, #ffffff00 ${speedRamp}%)`]: state.move < 0,
                                })
                            }}
                            className={clsx('z-10 h-12 w-12 transition-all flex justify-center items-center relative border-2 border-white rounded-full', {
                                'scale-[2.5] !border-[1px]': canDrag
                            })}>
                            <div
                                style={{
                                    marginLeft: state.x,
                                    marginTop: state.y,
                                }}
                                className='pointer-events-none h-1.5 w-1.5 rounded-full bg-white'></div>
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