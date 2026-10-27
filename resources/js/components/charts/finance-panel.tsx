import { lazy } from 'react';
import PerformanceVisual from '@/components/charts/performance-visual';
import {
    changeLabel,
    observationLabel,
    percentageLabel,
} from '@/lib/performance-format';
import type { FinancialHistory } from '@/types/economic-performance';

const FinanceHistoryChart = lazy(
    () => import('@/components/charts/finance-history-chart'),
);

export default function FinancePanel({
    history,
}: {
    history: FinancialHistory;
}) {
    if (history.rows.length === 0 || history.metrics.length === 0) {
        return (
            <p className="p-6 type-body">
                No observations are available for this period.
            </p>
        );
    }
    return (
        <div className="flex min-w-0 flex-col gap-3">
            <PerformanceVisual>
                <FinanceHistoryChart history={history} />
            </PerformanceVisual>
            <ul className="sr-only" aria-label="Annual Financial Observations">
                {history.rows.map((row) => (
                    <li key={row.year}>
                        {row.year}
                        <ul>
                            {history.metrics.map((metric) => {
                                const point = row.observations[metric.id];
                                return (
                                    <li key={metric.id}>
                                        {metric.label}:{' '}
                                        {observationLabel(point)}. Change
                                        {point?.comparisonYear
                                            ? ` from ${point.comparisonYear}`
                                            : ''}
                                        : {changeLabel(point)} (
                                        {percentageLabel(point)}).
                                    </li>
                                );
                            })}
                        </ul>
                    </li>
                ))}
            </ul>
            <p className="border-t pt-2 type-meta">
                Source:{' '}
                {history.source.sourceUrl ? (
                    <a
                        href={history.source.sourceUrl}
                        className="underline underline-offset-2"
                    >
                        {history.source.label}
                    </a>
                ) : (
                    history.source.label
                )}
                .
            </p>
        </div>
    );
}
