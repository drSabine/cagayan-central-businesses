import { ExactAmount } from '@/components/charts/exact-amount';
import { TrendMark } from '@/components/charts/trend-mark';
import { changeLabel, percentageLabel } from '@/lib/performance-format';
import { trendOf } from '@/lib/trend';
import type {
    EconomicObservation,
    MetricUnit,
} from '@/types/economic-performance';

/**
 * Direction and size of the change from the previous comparable year, with the exact amount on hover, focus or tap.
 * Direction only, never a rating (M26).
 */
export function ObservationChange({
    point,
    unit,
}: {
    point?: EconomicObservation;
    unit: MetricUnit;
}) {
    if (point?.state !== 'shown' || !point.comparable || point.change === null)
        return null;
    const trend = trendOf(point.change);
    if (!trend) return null;
    const exact = `${changeLabel(point, unit)} from ${point.comparisonYear}`;
    const visible =
        unit !== 'percent' && point.percentageChange !== null
            ? percentageLabel(point)
            : changeLabel(point, unit);
    const text = (
        <span
            className={`inline-flex items-center gap-1 font-mono type-data tabular-nums ${trend.tone}`}
        >
            <TrendMark trend={trend} />
            {visible}
        </span>
    );
    return visible === changeLabel(point, unit) ? (
        text
    ) : (
        <ExactAmount exact={exact} label={`${visible}, ${exact}`}>
            {text}
        </ExactAmount>
    );
}
