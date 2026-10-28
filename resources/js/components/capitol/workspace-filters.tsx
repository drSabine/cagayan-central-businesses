import type { ReactNode } from 'react';

export function WorkspaceFilters({
    children,
    title,
}: {
    children: ReactNode;
    title?: string;
}) {
    return (
        <aside
            aria-label={title ?? 'Filters'}
            className="order-first flex flex-col gap-4 rounded-sm border bg-card p-4 lg:order-last"
        >
            {title && <h2 className="type-item">{title}</h2>}
            {children}
        </aside>
    );
}
