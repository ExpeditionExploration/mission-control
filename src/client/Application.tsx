import logo from '../assets/logo.svg';
import { Menu, Expand, Shrink } from 'lucide-react';
import { UtilityBar, UtilityBarItems } from './components/UtilityBar';
import { JSX, useEffect, useState } from 'react';

export function Application({
    contextItems,
    headerLeftItems,
    headerRightItems,
    footerLeftItems,
    footerRightItems,
}: {
    contextItems: JSX.Element[];
    headerLeftItems: JSX.Element[];
    headerRightItems: JSX.Element[];
    footerLeftItems: JSX.Element[];
    footerRightItems: JSX.Element[];
}) {
    const [isFullScreen, setFullScreen] = useState(false);
    useEffect(() => {
        if (isFullScreen) {
            document.documentElement
                .requestFullscreen()
                .then(() => {
                    setFullScreen(true);
                })
                .catch(() => {});
        } else {
            document
                .exitFullscreen()
                .then(() => {
                    setFullScreen(false);
                })
                .catch(() => {});
        }
    }, [isFullScreen]);

    return (
        <div className="w-screen h-screen bg-gray-900 bg-gradient-to-t from-gray-950 text-white relative">
            <UtilityBar position="top" className="top-0">
                <UtilityBarItems className="items-start">
                    {headerLeftItems}
                </UtilityBarItems>
                <UtilityBarItems>
                    {headerRightItems}
                    <div
                        className="cursor-pointer"
                        onClick={() => {
                            setFullScreen(!isFullScreen);
                        }}
                    >
                        {isFullScreen ? <Shrink /> : <Expand />}
                    </div>
                    <Menu
                        size={30}
                        className="cursor-pointer"
                        onClick={() => {
                            console.log('Menu clicked');
                        }}
                    />
                </UtilityBarItems>
            </UtilityBar>
            <div className="absolute flex justify-center items-center w-full h-full z-0">
                {...contextItems}
            </div>
            <UtilityBar position="bottom">
                <UtilityBarItems className="items-end">
                    <div className="mr-8">
                        <img src={logo} alt="logo" className="h-12" />
                    </div>
                    {footerLeftItems}
                </UtilityBarItems>
                <UtilityBarItems>{footerRightItems}</UtilityBarItems>
            </UtilityBar>
        </div>
    );
}
