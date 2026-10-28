import { useState } from 'react';
import type { ReactNode } from 'react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * A short or rounded figure that shows the exact amount on hover, focus or tap. The exact text is also the
 * accessible name, so nothing depends on the pointer.
 */
export function ExactAmount({
    exact,
    label,
    children,
}: {
    exact: string;
    label?: string;
    children: ReactNode;
}) {
    const [open, setOpen] = useState(false);
    return (
        <TooltipProvider>
            <Tooltip open={open} onOpenChange={setOpen}>
                <TooltipTrigger asChild>
                    <button
                        type="button"
                        aria-label={label ?? exact}
                        className="min-h-6 cursor-help rounded-sm underline decoration-dotted underline-offset-4"
                        onClick={(event) => {
                            event.preventDefault();
                            setOpen((current) => !current);
                        }}
                    >
                        {children}
                    </button>
                </TooltipTrigger>
                <TooltipContent className="font-mono type-body tabular-nums">
                    {exact}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
