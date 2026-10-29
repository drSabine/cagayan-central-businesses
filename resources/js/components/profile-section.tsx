import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// One card of a business profile, with a Title Case heading.
export function ProfileSection({
    title,
    className,
    children,
}: {
    title: string;
    className?: string;
    children: ReactNode;
}) {
    return (
        <section
            className={cn(
                'flex flex-col gap-4 rounded-sm border bg-card p-4 md:p-5',
                className,
            )}
        >
            <h2 className="type-item">{title}</h2>
            {children}
        </section>
    );
}
