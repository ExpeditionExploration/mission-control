import { useEffect, useState, FunctionComponent } from "react"
import type Module from "../Module";
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
                case 'Digit0':
                    setBrightness(0);
                    break;
                case 'Digit1':
                    setBrightness(brightness => brightness == 25 ? 0 : 25);
                    break;
                case 'Digit2':
                    setBrightness(brightness => brightness == 50 ? 0 : 50);
                    break;
                case 'Digit3':
                    setBrightness(brightness => brightness == 75 ? 0 : 75);
                    break;
                case 'Digit4':
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

        return <FooterController
            className='w-10'
            icon={
                <div onClick={() => {
                    setBrightness(brightness => (brightness + 25) > 100 ? 0 : brightness + 25);
                }}>
                    <LightBulbIcon className={clsx('h-8 cursor-pointer text-gray-700',
                        isIR ? {
                            '!text-fuchsia-700': brightness == 25,
                            '!text-fuchsia-600': brightness == 50,
                            '!text-fuchsia-500': brightness == 75,
                            '!text-fuchsia-400': brightness == 100
                        } : {
                            '!text-yellow-700': brightness == 25,
                            '!text-yellow-500': brightness == 50,
                            '!text-yellow-300': brightness == 75,
                            '!text-yellow-100': brightness == 100
                        })} />
                </div>
            }
            name='Lights'
            status={`${brightness == 0 ? 'Off' : `${brightness}%`} ${isIR ? 'IR' : ''}`} />
    }
}