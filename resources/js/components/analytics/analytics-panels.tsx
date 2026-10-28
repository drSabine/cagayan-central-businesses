import type { ReactNode } from 'react';
import FinancePanel from '@/components/charts/finance-panel';
import { selectedBusiness, selectedFinance } from '@/lib/analytics';
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
 * Government finances and business trends for the selected town, shared by the public Economy page
 * and the Capitol Analytics page. The server decides where sales are bands.
 */
export function AnalyticsPanels({
    catalog,
    filters,
    financeControls,
    businessControls,
}: {
    catalog: AnalyticsCatalog;
    filters: AnalyticsFilters;
    financeControls?: ReactNode;
    businessControls?: ReactNode;
}) {
    const finance = selectedFinance(catalog, filters);
    const business = selectedBusiness(catalog, filters);
    const panel =
        'flex min-w-0 flex-col gap-3 rounded-sm border bg-card p-3 sm:p-4';

    return (
        <>
            <section aria-labelledby="finance-heading" className={panel}>
                <h2 id="finance-heading" className="type-heading">
                    Government Finances
                </h2>
                {financeControls}
                {finance ? (
                    <FinancePanel
                        key={`${filters.town}-${filters.measure}-${filters.period}`}
                        history={finance}
                    />
                ) : (
                    <Unavailable />
                )}
            </section>
            <section aria-labelledby="business-heading" className={panel}>
                <h2 id="business-heading" className="type-heading">
                    Business Trends
                </h2>
                {businessControls}
                {business ? (
                    <>
                        <FinancePanel
                            key={`${business.key}-counts`}
                            history={business.dataset.counts}
                        />
                        <h3 className="type-item">Declared Sales</h3>
                        <FinancePanel
                            key={`${business.key}-sales`}
                            history={business.dataset.sales}
                        />
                        <h3 className="type-item">Share of Town</h3>
                        <FinancePanel
                            key={`${business.key}-share`}
                            history={business.dataset.share}
                        />
                    </>
                ) : (
                    <Unavailable />
                )}
            </section>
        </>
    );
}
