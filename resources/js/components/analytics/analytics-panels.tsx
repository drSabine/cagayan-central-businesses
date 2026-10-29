import type { ReactNode } from 'react';
import { AnalyticsHelp } from '@/components/analytics/analytics-help';
import FinancePanel from '@/components/charts/finance-panel';
import { FinanceTrends } from '@/components/charts/finance-trends';
import {
    selectedBusiness,
    selectedFinance,
    selectedYear,
} from '@/lib/analytics';
import { NOT_AVAILABLE } from '@/lib/format';
import type {
    AnalyticsCatalog,
    AnalyticsFilters,
} from '@/types/economic-performance';

function Unavailable() {
    return (
        <p role="status" className="grid min-h-32 content-center type-heading">
            {NOT_AVAILABLE}
        </p>
    );
}

/**
 * Government finances for the selected town, plus business trends while simulated records are loaded. Shared by the
 * public Economy page and the Capitol Analytics page. The server decides where sales are bands.
 */
export function AnalyticsPanels({
    catalog,
    filters,
    onChange,
    financeControls,
    businessControls,
}: {
    catalog: AnalyticsCatalog;
    filters: AnalyticsFilters;
    onChange: (patch: Partial<AnalyticsFilters>) => void;
    financeControls?: ReactNode;
    businessControls?: ReactNode;
}) {
    const finance = selectedFinance(catalog, filters);
    const business = selectedBusiness(catalog, filters);
    const panel =
        'flex min-w-0 flex-col gap-3 rounded-sm border bg-card p-3 sm:p-4';
    const shown = {
        catalog,
        presentation: filters.presentation,
        year: selectedYear(catalog, filters),
        town: filters.town,
        onYear: (year: number) => onChange({ presentation: 'summary', year }),
    };

    return (
        <>
            <section aria-labelledby="finance-heading" className={panel}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-baseline gap-3">
                        <h2 id="finance-heading" className="type-heading">
                            Government Finances
                        </h2>
                        {filters.measure === 'business_taxes' && (
                            <span className="type-label">General Fund</span>
                        )}
                    </div>
                    <AnalyticsHelp
                        guide={catalog.guide}
                        showBusiness={catalog.businesses !== null}
                    />
                </div>
                {financeControls}
                {finance ? (
                    <FinancePanel
                        history={finance}
                        {...shown}
                        trends={
                            <FinanceTrends
                                history={finance}
                                filters={filters}
                                onChange={onChange}
                            />
                        }
                    />
                ) : (
                    <Unavailable />
                )}
            </section>
            {catalog.businesses && (
                <section aria-labelledby="business-heading" className={panel}>
                    <h2 id="business-heading" className="type-heading">
                        Business Trends
                    </h2>
                    <p className="type-label">Simulated Data</p>
                    {businessControls}
                    {business ? (
                        <>
                            <FinancePanel
                                history={business.dataset.counts}
                                {...shown}
                            />
                            <h3 className="type-item">Declared Sales</h3>
                            <FinancePanel
                                history={business.dataset.sales}
                                {...shown}
                            />
                            <h3 className="type-item">Share of Town</h3>
                            <FinancePanel
                                history={business.dataset.share}
                                {...shown}
                            />
                        </>
                    ) : (
                        <Unavailable />
                    )}
                </section>
            )}
        </>
    );
}
