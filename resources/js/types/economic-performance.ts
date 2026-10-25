import type { SelectOption } from '@/types/data';

export type PerformanceFilters = {
    town: string;
    period: 'all' | 'recent';
    wishView: 'cloud' | 'bars';
};

export type EconomicObservation = {
    state: 'shown' | 'unavailable' | 'hidden';
    value: string | null;
    comparable: boolean;
    change: string | null;
    percentageChange: number | null;
    comparisonYear: number | null;
};

export type EconomicMetric = {
    id: string;
    label: string;
    unit: string;
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

export type EconomicPerformance = {
    towns: SelectOption[];
    filters: PerformanceFilters;
    periods: Record<PerformanceFilters['period'], number>;
    datasets: Record<
        string,
        {
            finances: FinancialHistory;
            wishes: CommunityWishSnapshot;
        }
    >;
};
