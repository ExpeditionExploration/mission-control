// import { useEvents } from 'src/client/hooks';
import { ViewProps } from 'src/client/user-interface';
import { type LightsModuleClient } from '../client';
import { LightItem, LightColor } from './LightItem';

export const LightingGridController: React.FC<
    ViewProps<LightsModuleClient>
> = ({ module }) => {

    /**
     * Set the brightness of a specific light type (vis, ir, uv)
     * @param type The type of light to set ('vis', 'ir', 'uv')
     * @param brightness The brightness level (0-100)
     */
    const setLight = async (type: 'vis' | 'ir' | 'uv', brightness: number) => {
        Promise.resolve(module.setLight(type, brightness / 100)).catch((err) => {
            console.error('Failed to set light brightness', err);
        });
    };
    const setBrightnessPartial = (type: 'vis' | 'ir' | 'uv') => {
        return (brightness: number) => module.setLight(type, brightness);
    }

    return (
        <div className="relative h-14 flex flex-col gap-1 justify-center items-end">
            <LightItem setLight={setBrightnessPartial('vis')} color={LightColor.Yellow} name="Vis" />
            <LightItem setLight={setBrightnessPartial('ir')} color={LightColor.Red} name="IR" />
            <LightItem setLight={setBrightnessPartial('uv')} color={LightColor.Blue} name="UV" />
        </div>
    );
};
