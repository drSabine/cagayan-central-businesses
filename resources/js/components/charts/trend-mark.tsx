import type { ReactNode } from 'react';
import { CHANGE_WORDS, RESULT_WORDS, trendOf, trendWord } from '@/lib/trend';
import type { Trend } from '@/lib/trend';
import type { EconomicObservation } from '@/types/economic-performance';

export const RESULT_METRIC = 'performance.surplus';

/** The triangle, with its meaning in words so color and shape are never the only signal. */
export function TrendMark({
    trend,
    kind = 'change',
}: {
    trend: Trend;
    kind?: 'change' | 'result';
}) {
    return (
        <span
            role="img"
            aria-label={trendWord(
                trend,
                kind === 'result' ? RESULT_WORDS : CHANGE_WORDS,
            )}
        >
            {trend.glyph}
        </span>
    );
}

/**
 * A Surplus or Deficit amount: green with an up triangle for a surplus, red with a down triangle for a deficit.
 * Neutral and unmarked when the figure is zero, missing or hidden.
 */
export function ResultFigure({
    point,
    children,
    className = '',
}: {
    point?: EconomicObservation;
    children: ReactNode;
    className?: string;
}) {
    const trend =
        point?.state === 'shown' && point.value !== null
            ? trendOf(point.value)
            : null;
    if (!trend || trend.direction === 0)
        return <span className={className}>{children}</span>;
    return (
        <span
            className={`inline-flex items-center justify-end gap-1 ${trend.tone} ${className}`}
        >
            <TrendMark trend={trend} kind="result" />
            {children}
        </span>
    );
}
