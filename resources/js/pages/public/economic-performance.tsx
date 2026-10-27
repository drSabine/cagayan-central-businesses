import { Head, Link, router } from '@inertiajs/react';
import { ChartBar, Cloud, MessageSquarePlus } from 'lucide-react';
import { ChartViewSwitcher } from '@/components/charts/chart-view-switcher';
import FinancePanel from '@/components/charts/finance-panel';
import WishesPanel from '@/components/charts/wishes-panel';
import { LazyProvinceMap } from '@/components/lazy-province-map';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { NOT_AVAILABLE } from '@/lib/format';
import { economicPerformance } from '@/routes/public';
import { index as suggestions } from '@/routes/public/wishes';
import type {
    EconomicPerformance,
    PerformanceFilters,
} from '@/types/economic-performance';

type Option = { value: string; label: string };

const wishViews = [
    { value: 'cloud', label: 'Word Cloud', icon: Cloud },
    { value: 'bars', label: 'Ranked Bars', icon: ChartBar },
] as const;

function Picker({
    id,
    label,
    value,
    options,
    onChange,
}: {
    id: string;
    label: string;
    value: string;
    options: Option[];
    onChange: (value: string) => void;
}) {
    return (
        <Field className="min-w-0 gap-1">
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger id={id} className="min-h-10 w-full">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </Field>
    );
}

export default function EconomicPerformancePage({
    performance,
}: {
    performance: EconomicPerformance;
}) {
    const { filters } = performance;
    const dataset = performance.datasets[filters.town];
    const townName = performance.towns.find(
        (town) => town.value === filters.town,
    )?.label;
    const finances = dataset
        ? {
              ...dataset.finances,
              rows: dataset.finances.rows.filter(
                  (row) => row.year >= performance.periods[filters.period],
              ),
          }
        : null;
    const wishes = dataset?.wishes;
    const available = dataset !== undefined;
    const change = (patch: Partial<PerformanceFilters>) => {
        const selection = { ...filters, ...patch };
        if (!performance.towns.some((town) => town.value === selection.town))
            return;
        if (
            Object.keys(selection).every(
                (key) =>
                    selection[key as keyof PerformanceFilters] ===
                    filters[key as keyof PerformanceFilters],
            )
        )
            return;
        router.push({
            url: economicPerformance({ query: selection }).url,
            preserveState: true,
            preserveScroll: true,
            props: (props) => ({
                ...props,
                performance: { ...performance, filters: selection },
            }),
        });
    };

    return (
        <div className="grid gap-4">
            <Head title="Cagayan Economy" />
            <header className="flex flex-wrap items-end justify-between gap-3">
                <h1 className="type-title">Cagayan Economy</h1>
                <div className="w-full sm:w-72">
                    <Picker
                        id="performance-town"
                        label="Town"
                        value={filters.town}
                        options={performance.towns}
                        onChange={(town) => change({ town })}
                    />
                </div>
            </header>
            <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_18rem]">
                <section
                    aria-labelledby="finance-heading"
                    className="flex min-w-0 flex-col gap-3 rounded-sm border bg-card p-3 sm:p-4"
                >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 id="finance-heading" className="type-heading">
                            Government Finances
                        </h2>
                    </div>
                    {available && (
                        <div className="w-44">
                            <Picker
                                id="performance-period"
                                label="Period"
                                value={filters.period}
                                options={[
                                    { value: 'all', label: '2021 to 2025' },
                                    { value: 'recent', label: '2023 to 2025' },
                                ]}
                                onChange={(period) =>
                                    change({
                                        period: period as PerformanceFilters['period'],
                                    })
                                }
                            />
                        </div>
                    )}
                    {!available ? (
                        <div
                            role="status"
                            className="grid min-h-48 content-center gap-2"
                        >
                            <p className="type-heading">{NOT_AVAILABLE}</p>
                            <p className="type-meta">
                                Reliable financial data for this town is still
                                being gathered.
                            </p>
                        </div>
                    ) : (
                        finances && (
                            <FinancePanel
                                key={`${filters.town}-${filters.period}`}
                                history={finances}
                            />
                        )
                    )}
                </section>
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
                    <h2 id="wishes-heading" className="type-heading">
                        Community Wishes
                    </h2>
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
                {!available ? (
                    <p role="status" className="py-6 type-meta">
                        Community wishes are not available for this town yet.
                    </p>
                ) : (
                    wishes && (
                        <WishesPanel
                            key={`${filters.town}-${filters.wishView}`}
                            snapshot={wishes}
                            view={filters.wishView}
                        />
                    )
                )}
            </section>
        </div>
    );
}
