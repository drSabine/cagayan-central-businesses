import type { SelectOption } from '@/types/data';

export type AnalyticsFilters = {
    town: string;
    period: 'all' | 'recent';
    measure: string;
    dimension: 'industry' | 'tag';
    group: string | null;
};

export type PerformanceFilters = AnalyticsFilters & {
    wishView: 'cloud' | 'bars';
};

export type EconomicObservation = {
    state: 'shown' | 'unavailable' | 'hidden';
    value: string | null;
    comparable: boolean;
    change: string | null;
    percentageChange: number | null;
    comparisonYear: number | null;
    reason?:
        | 'not_published'
        | 'not_reported'
        | 'not_collected'
        | 'pending_review'
        | 'small_group'
        | 'dominance'
        | 'complementary'
        | null;
    band?: string | null;
    coverage?: { reporting: number; total: number; matched: number } | null;
    censusYear?: number | null;
    restatedIn?: number | null;
};

export type MetricUnit = 'php' | 'percent' | 'count';

export type EconomicMetric = {
    id: string;
    label: string;
    unit: MetricUnit;
    basis: string;
};

export type FinancialHistory = {
    metrics: EconomicMetric[];
    rows: { year: number; observations: Record<string, EconomicObservation> }[];
    axisMaximum: string;
    source: {
        mode: 'simulated' | 'verified';
        label: string;
        sourceUrl: string | null;
        verifiedOn: string | null;
    };
};

export type WishAggregate = { id: string; label: string; count: number };

export type CommunityWishSnapshot = {
    townCode: string;
    townName: string;
    asOf: string;
    period: string;
    source: string;
    items: WishAggregate[];
    cloudLimit: number;
};

export type BusinessTrends = {
    townCode: string;
    townName: string;
    groups: Record<AnalyticsFilters['dimension'], SelectOption[]>;
    datasets: Record<
        string,
        {
            counts: FinancialHistory;
            sales: FinancialHistory;
            share: FinancialHistory;
        }
    >;
};

export type AnalyticsCatalog = {
    towns: SelectOption[];
    measures: SelectOption[];
    periods: Record<AnalyticsFilters['period'], number>;
    lastYear: number;
    finances: Record<string, Record<string, FinancialHistory>>;
    businesses: BusinessTrends | null;
};

export type EconomicPerformance = {
    catalog: AnalyticsCatalog;
    filters: PerformanceFilters;
    wishes: Record<string, CommunityWishSnapshot>;
};
