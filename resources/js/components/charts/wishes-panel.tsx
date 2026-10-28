import { lazy } from 'react';
import PerformanceVisual from '@/components/charts/performance-visual';
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
    );
}
