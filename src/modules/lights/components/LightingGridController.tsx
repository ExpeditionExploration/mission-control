// import { useEvents } from 'src/client/hooks';
import { ViewProps } from 'src/client/user-interface';
import { type LightsModuleView } from '../view';
import { LightItem, LightColor } from './LightItem';

export const LightingGridController: React.FC<ViewProps<LightsModuleView>> = ({
    module,
}) => {
    return (
        <div className="relative grid gap-1 grid-cols-2 grid-rows-2 justify-center items-end">
            <LightItem color={LightColor.Yellow} />
            <LightItem color={LightColor.Yellow} />
            <LightItem color={LightColor.Red} />
            <LightItem color={LightColor.Blue} />
        </div>
    );
};
