import type { LucideIcon } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5',
} as const;

type GridProps = ComponentProps<'div'> & {
    columns?: keyof typeof columnClasses;
};

/*
 * Panels that share their borders, like a table without a header (design.md,
 * "Ruled grid"). Each cell draws its own top and left rule and the block hides
 * the outermost ones, so rules never double however the cells reflow.
 */
export function RuledGrid({ columns = 3, className, ...props }: GridProps) {
    return (
        <div className={cn('overflow-hidden border bg-card', className)}>
            <div
                className={cn('-mt-px -ml-px grid', columnClasses[columns])}
                {...props}
            />
        </div>
    );
}

export function RuledCell({ className, ...props }: ComponentProps<'div'>) {
    return (
        <div
            className={cn(
                'flex flex-col gap-3 border-t border-l p-5',
                className,
            )}
            {...props}
        />
    );
}

type FigureProps = {
    icon: LucideIcon;
    figure: ReactNode;
    label: string;
    caption?: ReactNode;
};

// Icon at the top, figure and words at the bottom, so cells in a row line up.
export function FigureCell({
    icon: Icon,
    figure,
    label,
    caption,
}: FigureProps) {
    return (
        <RuledCell className="min-h-40 justify-between lg:min-h-48">
            <Icon className="size-5" aria-hidden="true" />
            <div className="flex flex-col gap-1">
                <p className="type-figure">{figure}</p>
                <p className="type-lead">{label}</p>
                {caption && <p className="type-meta">{caption}</p>}
            </div>
        </RuledCell>
    );
}
