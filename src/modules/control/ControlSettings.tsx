import { useEvents } from 'src/client/hooks';

export function Hello({ onClick }: { onClick: () => void }): JSX.Element {
    const events = useEvents();
    console.log('Hello', events);
    return <div onClick={onClick}>Hello World!</div>;
}
