import { usePage } from '@inertiajs/react';
import { FlaskConical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

// Rendered only by the shared layouts, never by a page (privacy-rules.md, P13).
export function SimulatedLabel() {
    const { simulated } = usePage().props;

    if (!simulated) {
        return null;
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Badge
                    variant="outline"
                    tabIndex={0}
                    className="h-7 gap-1.5 px-2.5 text-sm"
                    data-test="simulated-label"
                >
                    <FlaskConical aria-hidden="true" />
                    Simulated data
                </Badge>
            </TooltipTrigger>
            <TooltipContent>
                Boundaries and population are real. Business records are
                simulated.
            </TooltipContent>
        </Tooltip>
    );
}
