import React, { useEffect, useState } from "react"
import { ClientModule as Module } from "../ClientModule";
import clsx from "clsx";

export const Control: Module = () => {
    const [state, setState] = useState({
        x: 0,
        y: 0,
        move: 0,
        drag: false,
        speed: 1,
        canSetSpeed: false
    });

    function dragControl(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        if (state.drag) {
            const target = evt.target as HTMLElement;
            setState({
                ...state,
                x: (evt.nativeEvent.offsetX - target.clientWidth / 2) * 2,
                y: (evt.nativeEvent.offsetY - target.clientHeight / 2) * 2,
            });
        }
    }

    function toggleDrag(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        setState({ ...state, drag: !state.drag });
    }

    function toggleSetSpeed(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        setState({ ...state, canSetSpeed: !state.canSetSpeed });
    }

    function setSpeed(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        if (state.canSetSpeed) {
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
        console.log('startMove')
        setState({ ...state, move: direction > 0 ? 1 : -1 });
    }

    function stopMove() {
        setState({ ...state, move: 0 });
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

    return (
        <>
            <div
                className={clsx('space-y-2 opacity-100 transition-opacity', {
                    '!opacity-0': state.drag,
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
                                'radial-gradient(circle at center, #ffffff44 0, #ffffff00 100%)': state.move == 0,
                                'radial-gradient(circle at center, #4444ffff 0, #ffffff00 100%)': state.move > 0,
                                'radial-gradient(circle at center, #ff0000ff 0, #ffffff00 100%)': state.move < 0,
                            })
                        }}
                        className={clsx('z-10 h-12 w-12 transition-all flex justify-center items-center relative border-2 border-white rounded-full', {
                            'scale-[2.5] !border-[1px]': state.drag
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
                    '!opacity-0': state.drag
                })}>Control</div>
            </div>

        </>
    )
}

Control.location = "right";
Control.id = "control";