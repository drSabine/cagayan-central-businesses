import type { ReactNode } from 'react';
import { NOT_AVAILABLE } from '@/lib/format';

// Labels over values in two columns from sm.
export function DetailGrid({ children }: { children: ReactNode }) {
    return <dl className="grid gap-4 sm:grid-cols-2">{children}</dl>;
}

// One label over its value. A missing value reads "Not available", never blank or 0.
export function DetailField({
    label,
    children,
}: {
    label: string;
    children?: ReactNode;
}) {
    const empty =
        children === null ||
        children === undefined ||
        children === false ||
        children === '';

    return (
        <div className="flex min-w-0 flex-col gap-0.5">
            <dt className="type-meta">{label}</dt>
            <dd className="type-body break-words">
                {empty ? (
                    <span className="text-muted-foreground">
                        {NOT_AVAILABLE}
                    </span>
                ) : (
                    children
                )}
            </dd>
        </div>
    );
}
