// import { useEvents } from 'src/client/hooks';
import { ControlModule } from './view';

export function ControlSettings({
    onClick,
    module,
}: {
    onClick: () => void;
    module: ControlModule;
}): JSX.Element {
    console.log('Hello', module);
    return <div onClick={onClick}>Hello World!</div>;
}
