import { lazy } from 'react';
import { Info } from 'lucide-react';
import PerformanceVisual from '@/components/charts/performance-visual';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { snapshotDate } from '@/lib/performance-format';
import type { CommunityWishSnapshot } from '@/types/economic-performance';

const WishRankingChart = lazy(
    () => import('@/components/charts/wish-ranking-chart'),
);
const WishWordCloud = lazy(() => import('@/components/charts/wish-word-cloud'));

export default function WishesPanel({
    snapshot,
    view,
}: {
    snapshot: CommunityWishSnapshot;
    view: 'cloud' | 'bars';
}) {
    if (snapshot.items.length === 0)
        return (
            <p className="p-6 type-body">
                No wishes are available for this town.
            </p>
        );
    return (
        <div className="flex min-w-0 flex-col gap-3">
            <PerformanceVisual key={view}>
                {view === 'bars' ? (
                    <WishRankingChart
                        items={snapshot.items}
                        townName={snapshot.townName}
                    />
                ) : (
                    <WishWordCloud
                        items={snapshot.items}
                        cloudLimit={snapshot.cloudLimit}
                        townName={snapshot.townName}
                    />
                )}
            </PerformanceVisual>
            <div className="flex items-center gap-2 border-t pt-2 type-meta">
                <p>Source: {snapshot.source}.</p>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            type="button"
                            className="inline-flex size-10 shrink-0 items-center justify-center rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            aria-label="Wishes Source Details"
                        >
                            <Info className="size-4" aria-hidden="true" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{snapshot.townName}</p>
                        <p>
                            {snapshot.period}, {snapshotDate(snapshot.asOf)}
                        </p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </div>
    );
}
