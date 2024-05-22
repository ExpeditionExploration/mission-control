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
        <div className="w-screen h-screen bg-neutral-900 text-white relative">
            <header className="absolute top-0 w-full z-10 flex">
                <div>{headerLeftItems}</div>
                <div>{headerRightItems}</div>
            </header>
            <div className="absolute flex justify-center items-center w-full h-full z-0">
                {contextItems}
            </div>
            <footer className="absolute bottom-0 w-full z-10 flex">
                <div>{footerLeftItems}</div>
                <div>{footerRightItems}</div>
            </footer>
        </div>
    );
}
