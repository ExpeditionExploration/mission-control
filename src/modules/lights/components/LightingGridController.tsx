// import { useEvents } from 'src/client/hooks';
import { ViewProps } from 'src/client/user-interface';
import { type LightsModuleView } from '../view';
import { LightItem, LightColor } from './LightItem';

export const LightingGridController: React.FC<ViewProps<LightsModuleView>> = ({
    module,
}) => {
    return (
        <div className="relative grid gap-1 grid-cols-2 grid-rows-2 justify-center items-end">
            <LightItem color={LightColor.Yellow} name="Flood" />
            <LightItem color={LightColor.Yellow} name="Spot" />
            <LightItem color={LightColor.Red} name="IR" />
            <LightItem color={LightColor.Blue} name="UV" />
        </div>
    );
};
