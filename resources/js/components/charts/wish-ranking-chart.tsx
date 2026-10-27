import { WishTooltip } from '@/components/charts/wish-tooltip';
import { formatCount } from '@/lib/format';
import type { WishAggregate } from '@/types/economic-performance';

export default function WishRankingChart({
    items,
    townName,
}: {
    items: WishAggregate[];
    townName: string;
}) {
    const maximum = Math.max(1, items[0]?.count ?? 0);
    return (
        <div
            className="max-h-[30rem] overflow-y-auto overscroll-contain pr-2"
            role="region"
            aria-label={`Business Wishes in ${townName}`}
            tabIndex={0}
        >
            <ol className="grid gap-1">
                {items.map((item) => (
                    <li key={item.id}>
                        <WishTooltip item={item} townName={townName}>
                            <div
                                tabIndex={0}
                                className="grid cursor-default gap-2 rounded-sm px-2 py-3 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                aria-label={`${item.label}: ${formatCount(item.count)} wishes in ${townName}`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <span className="min-w-0 type-body wrap-anywhere">
                                        {item.label}
                                    </span>
                                    <span className="shrink-0 font-mono type-body tabular-nums">
                                        {formatCount(item.count)}
                                    </span>
                                </div>
                                <div
                                    className="h-2 overflow-hidden rounded-sm bg-muted"
                                    aria-hidden="true"
                                >
                                    <div
                                        className="h-full rounded-sm bg-chart-1"
                                        style={{
                                            width: `${(item.count / maximum) * 100}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        </WishTooltip>
                    </li>
                ))}
            </ol>
        </div>
    );
}
