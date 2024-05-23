import { cn } from '../utility';

// export interface UtilityBarProps extends React.HTMLProps<HTMLDivElement> {}
export const UtilityBar: React.FC<React.HTMLProps<HTMLDivElement>> = (
    props,
) => (
    <div
        className={cn(
            'absolute justify-between p-6 w-full z-10 flex',
            props.className,
        )}
    >
        {props.children}
    </div>
);
UtilityBar.displayName = 'UtilityBar';

export const UtilityBarItems: React.FC<React.HTMLProps<HTMLDivElement>> = (
    props,
) => (
    <div className={cn('flex items-center space-x-4', props.className)}>
        {props.children}
    </div>
);
UtilityBarItems.displayName = 'UtilityBarItems';
