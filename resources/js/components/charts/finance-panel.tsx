import { lazy } from 'react';
import PerformanceVisual from '@/components/charts/performance-visual';
import {
    changeLabel,
    observationLabel,
    observationNote,
    percentageLabel,
} from '@/lib/performance-format';
import type { FinancialHistory } from '@/types/economic-performance';

const FinanceHistoryChart = lazy(
    () => import('@/components/charts/finance-history-chart'),
);

/**
 * A yearly series as a chart with an equivalent screen-reader list, or as a visible list when nothing can be
 * plotted: declared sales shown as bands (P7) or a series that is entirely hidden.
 */
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
    const listed = !history.rows.some((row) =>
        Object.values(row.observations).some(
            (point) => point.state === 'shown' && point.value !== null,
        ),
    );
    return (
        <div className="flex min-w-0 flex-col gap-3">
            {!listed && (
                <PerformanceVisual>
                    <FinanceHistoryChart history={history} />
                </PerformanceVisual>
            )}
            <ul
                className={listed ? 'flex flex-col gap-2' : 'sr-only'}
                aria-label="Annual Observations"
            >
                {history.rows.map((row) => (
                    <li key={row.year} className="type-body">
                        <span className="font-mono tabular-nums">
                            {row.year}
                        </span>
                        <ul>
                            {history.metrics.map((metric) => {
                                const point = row.observations[metric.id];
                                const note = observationNote(point);
                                return (
                                    <li key={metric.id}>
                                        {listed ? '' : `${metric.label}: `}
                                        <span className="font-mono tabular-nums">
                                            {observationLabel(
                                                point,
                                                metric.unit,
                                            )}
                                        </span>
                                        {note && ' '}
                                        {note && (
                                            <span className="ml-1 type-meta">
                                                {note}
                                            </span>
                                        )}
                                        {!listed &&
                                            `. Change${point?.comparisonYear ? ` from ${point.comparisonYear}` : ''}: ${changeLabel(point, metric.unit)} (${percentageLabel(point)}).`}
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
