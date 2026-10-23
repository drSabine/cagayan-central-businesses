import { usePage } from '@inertiajs/react';

// Rendered only by the shared layouts, never by a page (privacy-rules.md, P13). Home explains it under "About the data".
export function SimulatedLabel() {
    const { simulated } = usePage().props;

    if (!simulated) {
        return null;
    }

    return (
        <span
            className="shrink-0 rounded-sm border px-1.5 py-0.5 font-mono text-xs text-muted-foreground"
            data-test="simulated-label"
        >
            Simulated data
        </span>
    );
}
