// import { useEvents } from 'src/client/hooks';
import { ViewProps } from 'src/client/user-interface';
import { type MediaModule } from '../view';
import { cn } from 'src/client/utility';

export const MediaContextItem: React.FC<ViewProps<MediaModule>> = ({
    module,
}) => {
    return (
        <div>
            <video
                id="video"
                width={640}
                height={480}
                controls
                autoPlay
            ></video>
        </div>
    );
};
