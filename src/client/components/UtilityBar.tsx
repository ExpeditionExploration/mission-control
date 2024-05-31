import { cn } from '../utility';

export interface UtilityBarProps extends React.HTMLProps<HTMLDivElement> {
    position: 'top' | 'bottom';
}
export const UtilityBar: React.FC<UtilityBarProps> = (props) => (
    <div
        className={cn(
            'absolute justify-between p-6 bg-transparent from-black/60 w-full z-10 flex',
            props.className,
            {
                'top-0 bg-gradient-to-b pb-20': props.position === 'top',
                'bottom-0 bg-gradient-to-t pt-20': props.position === 'bottom',
            },
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
