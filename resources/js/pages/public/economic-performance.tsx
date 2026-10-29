import { Head, Link } from '@inertiajs/react';
import { ChartBar, Cloud, MessageSquarePlus } from 'lucide-react';
import { AnalyticsPanels } from '@/components/analytics/analytics-panels';
import { AnalyticsPickers } from '@/components/analytics/analytics-pickers';
import { ChartViewSwitcher } from '@/components/charts/chart-view-switcher';
import WishesPanel from '@/components/charts/wishes-panel';
import { LazyProvinceMap } from '@/components/lazy-province-map';
import { Button } from '@/components/ui/button';
import { pushFilters, withCoveredMeasure } from '@/lib/analytics';
import { economicPerformance } from '@/routes/public';
import { index as suggestions } from '@/routes/public/wishes';
import type {
    EconomicPerformance,
    PerformanceFilters,
} from '@/types/economic-performance';

const wishViews = [
    { value: 'cloud', label: 'Word Cloud', icon: Cloud },
    { value: 'bars', label: 'Ranked Bars', icon: ChartBar },
] as const;

export default function EconomicPerformancePage({
    performance,
}: {
    performance: EconomicPerformance;
}) {
    const { catalog, filters } = performance;
    const townName = catalog.towns.find(
        (town) => town.value === filters.town,
    )?.label;
    const wishes = performance.wishes[filters.town];
    const change = (patch: Partial<PerformanceFilters>) => {
        if (patch.town && !catalog.towns.some((t) => t.value === patch.town))
            return;
        pushFilters(
            filters,
            withCoveredMeasure(catalog, filters, patch),
            (query) => economicPerformance({ query }).url,
            (props, next) => ({
                ...props,
                performance: { ...performance, filters: next },
            }),
        );
    };

    return (
        <div className="grid gap-4">
            <Head title="Cagayan Economy" />
            <header className="flex flex-wrap items-end justify-between gap-3">
                <h1 className="type-title">Cagayan Economy</h1>
                <div className="w-full sm:w-72">
                    <AnalyticsPickers
                        idPrefix="performance"
                        catalog={catalog}
                        filters={filters}
                        fields={['town']}
                        onChange={change}
                    />
                </div>
            </header>
            <div className="grid min-w-0 items-start gap-3 lg:grid-cols-[minmax(0,1fr)_18rem]">
                <div className="flex min-w-0 flex-col gap-3">
                    <AnalyticsPanels
                        catalog={catalog}
                        filters={filters}
                        onChange={change}
                        financeControls={
                            <div className="grid gap-3 sm:grid-cols-3">
                                <AnalyticsPickers
                                    idPrefix="performance"
                                    catalog={catalog}
                                    filters={filters}
                                    fields={['presentation', 'measure', 'year']}
                                    onChange={change}
                                />
                            </div>
                        }
                        businessControls={
                            <div className="grid gap-3 sm:grid-cols-2 lg:w-2/3">
                                <AnalyticsPickers
                                    idPrefix="performance"
                                    catalog={catalog}
                                    filters={filters}
                                    fields={['dimension', 'group']}
                                    onChange={change}
                                />
                            </div>
                        }
                    />
                </div>
                <aside
                    aria-label="Town Explorer"
                    className="dark flex min-w-0 flex-col gap-2 rounded-sm bg-brand p-3 text-brand-foreground sm:p-4"
                >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="type-heading">Cagayan</h2>
                        <span className="type-meta text-brand-foreground">
                            {townName}
                        </span>
                    </div>
                    <div className="h-64 sm:h-72 lg:h-96">
                        <LazyProvinceMap
                            mapStyle="solid"
                            label="Choose a Town in Cagayan"
                            highlight={[filters.town]}
                            onSelect={(town) => change({ town })}
                            water
                            className="size-full"
                        />
                    </div>
                </aside>
            </div>
            <section
                aria-labelledby="wishes-heading"
                className="flex min-w-0 flex-col gap-3 rounded-sm border bg-card p-3 sm:p-4"
            >
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-baseline gap-3">
                        <h2 id="wishes-heading" className="type-heading">
                            Community Wishes
                        </h2>
                        {wishes && (
                            <span className="type-label">{wishes.source}</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline">
                            <Link
                                href={suggestions({
                                    query: { town: filters.town },
                                })}
                            >
                                <MessageSquarePlus
                                    className="size-4"
                                    aria-hidden="true"
                                />
                                Share Your Wish
                            </Link>
                        </Button>
                        <ChartViewSwitcher
                            label="Wishes View"
                            value={filters.wishView}
                            options={wishViews}
                            onChange={(wishView) => change({ wishView })}
                        />
                    </div>
                </div>
                {wishes ? (
                    <WishesPanel
                        key={`${filters.town}-${filters.wishView}`}
                        snapshot={wishes}
                        view={filters.wishView}
                    />
                ) : (
                    <p role="status" className="py-6 type-meta">
                        Community wishes are not available for this town yet.
                    </p>
                )}
            </section>
        </div>
    );
}
