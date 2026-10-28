import { router } from '@inertiajs/react';
import type {
    AnalyticsCatalog,
    AnalyticsFilters,
    FinancialHistory,
} from '@/types/economic-performance';

/** The selected finance series, trimmed to the selected period. Absent means not available. */
export function selectedFinance(
    catalog: AnalyticsCatalog,
    filters: AnalyticsFilters,
): FinancialHistory | null {
    const history = catalog.finances[filters.town]?.[filters.measure];
    if (!history) return null;
    const first = catalog.periods[filters.period];
    return {
        ...history,
        rows: history.rows.filter((row) => row.year >= first),
    };
}

/** The selected business group, falling back to the first group of the dimension. Only the connected town has one. */
export function selectedBusiness(
    catalog: AnalyticsCatalog,
    filters: AnalyticsFilters,
) {
    const businesses = catalog.businesses;
    if (!businesses || businesses.townCode !== filters.town) return null;
    const groups = businesses.groups[filters.dimension];
    const key = groups.some((group) => group.value === filters.group)
        ? filters.group
        : groups[0]?.value;
    return key ? { key, groups, dataset: businesses.datasets[key] } : null;
}

/**
 * Every selection is already loaded, so a change only updates the URL and props in local history
 * (frontend.md, "Local Selection Contract"). Unchanged selections do nothing.
 */
export function pushFilters<T extends AnalyticsFilters>(
    current: T,
    patch: Partial<T>,
    url: (query: Record<string, string>) => string,
    props: (
        props: Record<string, unknown>,
        filters: T,
    ) => Record<string, unknown>,
) {
    const next = { ...current, ...patch };
    if (patch.dimension && patch.dimension !== current.dimension)
        next.group = null;
    const keys = Object.keys(next) as (keyof T)[];
    if (keys.every((key) => next[key] === current[key])) return;
    router.push({
        url: url(
            Object.fromEntries(
                Object.entries(next).filter(
                    ([, value]) => value !== null && value !== undefined,
                ),
            ) as Record<string, string>,
        ),
        preserveState: true,
        preserveScroll: true,
        props: (current) => props(current, next),
    });
}
