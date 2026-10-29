import { router } from '@inertiajs/react';
import type {
    AnalyticsCatalog,
    AnalyticsFilters,
    AnalyticsMeasure,
    FinancialHistory,
} from '@/types/economic-performance';

/** The Sum of Reporting Towns uses the province code but is never the provincial government's accounts (M27). */
export const ALL_TOWNS = '0201500000';

export function measureCovers(
    measure: AnalyticsMeasure | undefined,
    town: string,
): boolean {
    return !measure?.towns || measure.towns.includes(town);
}

/** A selection that lands on a town without the chosen measure falls back to Government Totals. */
export function withCoveredMeasure<T extends AnalyticsFilters>(
    catalog: AnalyticsCatalog,
    filters: T,
    patch: Partial<T>,
): Partial<T> {
    const town = patch.town ?? filters.town;
    const measure = patch.measure ?? filters.measure;
    return measureCovers(
        catalog.measures.find((item) => item.value === measure),
        town,
    )
        ? patch
        : { ...patch, measure: 'totals' };
}

/** Only select finished observations; no financial metrics are computed in the browser. */
export function latestYear(history: FinancialHistory): number | null {
    return (
        history.rows.findLast((row) =>
            Object.values(row.observations).some(
                (point) =>
                    point.state === 'shown' &&
                    (point.value !== null || point.band != null),
            ),
        )?.year ?? null
    );
}

export function selectedYear(
    catalog: AnalyticsCatalog,
    filters: AnalyticsFilters,
): number | null {
    if (filters.year !== null) return filters.year;
    const histories = catalog.finances[filters.town];
    const selected = histories?.[filters.measure];
    const totals = histories?.totals;
    return (
        (selected ? latestYear(selected) : null) ??
        (totals ? latestYear(totals) : null)
    );
}

export function periodHistory(
    history: FinancialHistory,
    catalog: AnalyticsCatalog,
    period: AnalyticsFilters['period'],
    endingYear = latestYear(history),
): FinancialHistory {
    if (endingYear === null) return history;
    const first =
        period === 'all'
            ? catalog.periods.all
            : period === 'recent'
              ? catalog.periods.recent
              : endingYear - Number(period[0]) + 1;
    return {
        ...history,
        rows: history.rows.filter(
            (row) => row.year >= first && row.year <= endingYear,
        ),
    };
}

export function selectedFinance(
    catalog: AnalyticsCatalog,
    filters: AnalyticsFilters,
): FinancialHistory | null {
    const history = catalog.finances[filters.town]?.[filters.measure];
    if (!history || filters.presentation !== 'trends') return history ?? null;
    const period = periodHistory(history, catalog, filters.period);
    const first = period.rows.find((row) =>
        Object.values(row.observations).some(
            (point) => point.state === 'shown' && point.value !== null,
        ),
    )?.year;
    return {
        ...period,
        rows:
            first === undefined
                ? []
                : period.rows.filter((row) => row.year >= first),
    };
}

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
    if (!key) return null;
    const dataset = businesses.datasets[key];
    const end = latestYear(dataset.counts);
    return {
        key,
        groups,
        dataset:
            filters.presentation === 'trends'
                ? {
                      counts: periodHistory(
                          dataset.counts,
                          catalog,
                          filters.period,
                          end,
                      ),
                      sales: periodHistory(
                          dataset.sales,
                          catalog,
                          filters.period,
                          end,
                      ),
                      share: periodHistory(
                          dataset.share,
                          catalog,
                          filters.period,
                          end,
                      ),
                  }
                : dataset,
    };
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
    if (patch.measure && patch.measure !== current.measure) next.metric = null;
    if (patch.dimension && patch.dimension !== current.dimension)
        next.group = null;
    const keys = Object.keys(next) as (keyof T)[];
    if (keys.every((key) => next[key] === current[key])) return;
    router.push({
        url: url(
            Object.fromEntries(
                Object.entries(next)
                    .filter(
                        ([, value]) => value !== null && value !== undefined,
                    )
                    .map(([key, value]) => [key, String(value)]),
            ) as Record<string, string>,
        ),
        preserveState: true,
        preserveScroll: true,
        props: (current) => props(current, next),
    });
}
