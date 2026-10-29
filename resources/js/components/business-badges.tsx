import type { ReactNode } from 'react';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatDate } from '@/lib/format';
import { icons } from '@/lib/icons';
import { cn } from '@/lib/utils';

const PERMIT: Record<string, { dot: string; word: string }> = {
    valid: { dot: 'bg-status-new', word: 'Valid' },
    expiring: { dot: 'bg-status-not-renewed', word: 'Expiring' },
    expired: { dot: 'bg-status-closed', word: 'Expired' },
};

function Mark({ label, children }: { label: string; children: ReactNode }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span className="inline-flex items-center gap-1">
                    {children}
                    <span className="sr-only">{label}</span>
                </span>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
        </Tooltip>
    );
}

// The list row shows only this: the BIR shield, named in a tooltip and for screen readers.
export function BirMark({ className }: { className?: string }) {
    const Bir = icons.birRegistered;

    return (
        <Mark label="BIR registered">
            <Bir
                className={cn('size-4 text-primary', className)}
                aria-hidden="true"
            />
        </Mark>
    );
}

// Quiet mono marks: muted icons, color only on the permit dot, and one bordered BIR badge so it is never missed.
export function BusinessBadges({
    bir,
    permit,
    validUntil,
    isNew,
    streak,
    className,
}: {
    bir: boolean | string | null;
    permit: string;
    validUntil?: string | null;
    isNew: boolean;
    streak: number;
    className?: string;
}) {
    const status = PERMIT[permit];
    const Bir = icons.birRegistered;
    const New = icons.isNew;
    const Streak = icons.streak;

    return (
        <span
            className={cn(
                'inline-flex items-center gap-3 font-mono type-data text-muted-foreground tabular-nums',
                className,
            )}
        >
            {bir && (
                <Mark
                    label={
                        typeof bir === 'string'
                            ? `BIR registered, certificate checked ${formatDate(bir)}`
                            : 'BIR registered'
                    }
                >
                    <span
                        aria-hidden="true"
                        className="inline-flex items-center gap-1 rounded-sm border border-primary/50 px-1.5 py-0.5 font-medium text-primary"
                    >
                        <Bir className="size-3.5" />
                        BIR
                    </span>
                </Mark>
            )}
            {status && (
                <Mark
                    label={
                        validUntil
                            ? `Business permit ${status.word.toLowerCase()}, until ${formatDate(validUntil)}`
                            : `Business permit ${status.word.toLowerCase()}`
                    }
                >
                    <span
                        aria-hidden="true"
                        className="inline-flex items-center gap-1.5 rounded-sm border px-1.5 py-0.5 font-medium text-foreground"
                    >
                        <span
                            className={cn('size-2 rounded-full', status.dot)}
                        />
                        {status.word}
                    </span>
                </Mark>
            )}
            {isNew && (
                <Mark label="New this year">
                    <New className="size-3.5" aria-hidden="true" />
                    <span aria-hidden="true">New</span>
                </Mark>
            )}
            {streak > 1 && (
                <Mark label={`Renewed ${streak} years in a row`}>
                    <Streak className="size-3.5" aria-hidden="true" />
                    <span aria-hidden="true">{streak}</span>
                </Mark>
            )}
        </span>
    );
}
