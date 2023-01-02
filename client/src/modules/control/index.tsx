import React, { useEffect } from "react"
import Module, { ModuleLocation } from "../ClientModule";
import clsx from "clsx";

export class Control extends Module {
    static location: ModuleLocation = "right";
    state = {
        x: 0,
        y: 0,
        move: 0,
        drag: false,
        speed: 1
    }

    startMove(direction: number) {
        this.setState({ ...this.state, move: direction > 0 ? 1 : -1 });
    }

    stopMove() {
        this.setState({ ...this.state, move: 0 });
    }

    componentDidMount() {
        window.addEventListener('keydown', event => {
            switch (event.code) {
                case 'WKey':
                    this.startMove(1);
                    break;
                case 'SKey':
                    this.startMove(-1);
                    break;
            }
        });
        window.addEventListener('keyup', event => {
            switch (event.code) {
                case 'WKey':
                    this.stopMove();
                    break;
                case 'SKey':
                    this.stopMove();
                    break;
            }
        });
    }

    dragControl(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        if (this.state.drag) {
            const target = evt.target as HTMLElement;
            this.setState({
                ...this.state,
                x: (evt.nativeEvent.offsetX - target.clientWidth / 2) * 2,
                y: (evt.nativeEvent.offsetY - target.clientHeight / 2) * 2,
            });
        }
    }

    toggleDrag(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        this.setState({ ...this.state, drag: !this.state.drag });
    }

    canSetSpeed = false;
    toggleSetSpeed(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        this.canSetSpeed = !this.canSetSpeed;
    }
    setSpeed(evt: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        if (this.canSetSpeed) {
            const target = evt.target as HTMLElement;
            console.log(evt.nativeEvent.offsetY)
            let percent = evt.nativeEvent.offsetY / target.clientHeight;
            if (isNaN(percent)) percent = 0;
            percent = (percent - 0.2) / (0.8 - 0.2)
            percent = Math.min(Math.max(percent, 0), 1);
            percent = 1 - percent;
            this.setState({ ...this.state, speed: percent });
        }
    }

    render() {
        return (
            <>
                <div
                    className={clsx('space-y-2 opacity-100 transition-opacity', {
                        '!opacity-0': this.state.drag,
                    })}>
                    <div
                        className='h-16 flex justify-center items-center'>
                        <div
                            onClick={evt => this.toggleSetSpeed(evt)}
                            onMouseMove={evt => this.setSpeed(evt)}
                            className="relative w-6 h-12 flex justify-center">
                            <div className='pointer-events-none h-full w-0 relative border-0 border-l-2 border-white'></div>
                            <div style={{
                                top: `${(1 - this.state.speed) * 100}%`,
                            }} className='pointer-events-none absolute h-0 w-full border-t-2 border-white'></div>
                        </div>
                    </div>
                    <div className='text-xs'>Speed</div>
                </div>
                <div className='space-y-2'>
                    <div className={clsx('h-16 flex justify-center items-center relative', {
                        'cursor-move': this.state.move,
                        'cursor-pointer': !this.state.move,
                    })}>
                        <div
                            onClick={(evt) => this.toggleDrag(evt)}
                            onMouseMove={(evt) => this.dragControl(evt)}
                            style={{
                                background: clsx({
                                    'radial-gradient(circle at center, #ffffff44 0, #ffffff00 100%)': this.state.move == 0,
                                    'radial-gradient(circle at center, #4444ffff 0, #ffffff00 100%)': this.state.move > 0,
                                    'radial-gradient(circle at center, #ff0000ff 0, #ffffff00 100%)': this.state.move < 0,
                                })
                            }}
                            className={clsx('z-10 h-12 w-12 transition-all flex justify-center items-center relative border-2 border-white rounded-full', {
                                'scale-[2.5] !border-[1px]': this.state.drag
                            })}>
                            <div
                                style={{
                                    marginLeft: this.state.x,
                                    marginTop: this.state.y,
                                }}
                                className='pointer-events-none h-1.5 w-1.5 rounded-full bg-white'></div>
                        </div>
                    </div>
                    <div className={clsx('text-xs opacity-100 transition-opacity', {
                        '!opacity-0': this.state.drag
                    })}>Control</div>
                </div>

            </>
        )
    }
}
