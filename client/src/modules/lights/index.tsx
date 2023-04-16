import { useEffect, useState, FunctionComponent } from "react"
import type Module from "../../types";
import clsx from "clsx";
import { ArrowsPointingInIcon, ArrowsPointingOutIcon, LightBulbIcon } from "@heroicons/react/24/outline";
import FooterController from "../../components/FooterController";

export const Lights: Module = {
    left: ({
        events,
        send
    }) => {
        const [brightness, setBrightness] = useState(0);
        const [isIR, setIsIR] = useState(false);

        function keyupListener(event: KeyboardEvent) {
            switch (event.code) {
                case 'Digit1':
                    setBrightness(brightness => brightness == 10 ? 0 : 10);
                    break;
                case 'Digit2':
                    setBrightness(brightness => brightness == 20 ? 0 : 20);
                    break;
                case 'Digit3':
                    setBrightness(brightness => brightness == 30 ? 0 : 30);
                    break;
                case 'Digit4':
                    setBrightness(brightness => brightness == 40 ? 0 : 40);
                    break;
                case 'Digit5':
                    setBrightness(brightness => brightness == 50 ? 0 : 50);
                    break;
                case 'Digit6':
                    setBrightness(brightness => brightness == 60 ? 0 : 60);
                    break;
                case 'Digit7':
                    setBrightness(brightness => brightness == 70 ? 0 : 70);
                    break;
                case 'Digit8':
                    setBrightness(brightness => brightness == 80 ? 0 : 80);
                    break;
                case 'Digit9':
                    setBrightness(brightness => brightness == 90 ? 0 : 90);
                    break;
                case 'Digit0':
                    setBrightness(brightness => brightness == 100 ? 0 : 100);
                    break;
                case 'KeyQ':
                    setIsIR(isIR => !isIR);
                    break;
            }
        }


        useEffect(() => {
            window.addEventListener('keyup', keyupListener);
            return () => {
                window.removeEventListener('keyup', keyupListener);
            }
        }, []);

        useEffect(() => {
            send(brightness, 'setBrightness');
        }, [brightness]);

        return <FooterController
            className='w-10'
            icon={
                <div onClick={() => {
                    setBrightness(brightness => (brightness + 10) > 100 ? 0 : brightness + 10);
                }}>
                    <LightBulbIcon className={clsx('h-8 cursor-pointer text-gray-700',
                        isIR ? {
                            '!text-fuchsia-800': brightness == 10,
                            '!text-fuchsia-700': brightness == 20,
                            '!text-fuchsia-600': brightness == 30,
                            '!text-fuchsia-500': brightness == 40,
                            '!text-fuchsia-400': brightness == 50,
                            '!text-fuchsia-300': brightness == 60,
                            '!text-fuchsia-200': brightness == 70,
                            '!text-fuchsia-100': brightness == 80,
                            '!text-fuchsia-50': brightness == 90,
                            '!text-white': brightness == 100
                        } : {
                            '!text-yellow-800': brightness == 10,
                            '!text-yellow-700': brightness == 20,
                            '!text-yellow-600': brightness == 30,
                            '!text-yellow-500': brightness == 40,
                            '!text-yellow-400': brightness == 50,
                            '!text-yellow-300': brightness == 60,
                            '!text-yellow-200': brightness == 70,
                            '!text-yellow-100': brightness == 80,
                            '!text-yellow-50': brightness == 90,
                            '!text-white': brightness == 100
                        })} />
                </div>
            }
            name='Lights'
            status={`${brightness == 0 ? 'Off' : `${brightness}%`} ${isIR ? 'IR' : ''}`} />
    }
}