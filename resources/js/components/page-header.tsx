import type { ReactNode } from 'react';

type Props = {
    label?: string;
    title: string;
    subtitle?: ReactNode;
    actions?: ReactNode;
};

// The answer first (design.md, "Principles"). The title is one name with no separators.
export function PageHeader({ label, title, subtitle, actions }: Props) {
    return (
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex max-w-3xl flex-col gap-2">
                {label && <p className="type-label">{label}</p>}
                <h1 className="type-title">{title}</h1>
                {subtitle && <div className="type-subtitle">{subtitle}</div>}
            </div>
            {actions && (
                <div className="flex flex-wrap items-center gap-3">
                    {actions}
                </div>
            )}
        </header>
    );
}
