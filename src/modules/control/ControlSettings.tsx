export function Hello({ onClick }: { onClick: () => void }): JSX.Element {
    return <div onClick={onClick}>Hello World!!!</div>;
}
