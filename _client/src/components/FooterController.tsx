import clsx from 'clsx';

export default function FooterController({
    icon: Icon,
    name,
    status,
    className,
    ...props
}: {
    icon: JSX.Element | null,
    name: JSX.Element | string | null,
    status?: JSX.Element | string | null,
    [key: string]: any
}) {
    return (
        <div className={clsx('space-y-2 flex flex-col justify-center', className)} {...props}>
            <div className='h-16 flex justify-center items-center'>
                {Icon}
            </div>
            <div className='text-xs h-8 flex flex-col items-center justify-end text-center'>
                <div className='font-bold' style={{ fontSize: '75%' }}>{status}</div>
                {name}
            </div>
        </div >
    );
}