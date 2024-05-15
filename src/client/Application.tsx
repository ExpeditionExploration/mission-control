import './App.css';

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
    return (
        <div>
            <div>{contextItems}</div>
            <div>{headerLeftItems}</div>
            <div>{headerRightItems}</div>
            <div>{footerLeftItems}</div>
            <div>{footerRightItems}</div>
        </div>
    );
}
