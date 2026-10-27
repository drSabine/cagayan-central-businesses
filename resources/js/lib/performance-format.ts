import { HIDDEN_FIGURE, LOCALE, NOT_AVAILABLE, TIME_ZONE } from '@/lib/format';
import type { EconomicObservation } from '@/types/economic-performance';

const pesos = new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
});
const signedPesos = new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: 'PHP',
    signDisplay: 'exceptZero',
    minimumFractionDigits: 2,
});
const percent = new Intl.NumberFormat(LOCALE, {
    signDisplay: 'exceptZero',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
});
const compact = new Intl.NumberFormat(LOCALE, {
    notation: 'compact',
    maximumFractionDigits: 1,
});

export function formatExactPesos(value: string): string {
    return pesos.format(Number(value));
}

export function formatPesoTick(value: number): string {
    return `₱${compact.format(value)}`;
}

export function observationLabel(point?: EconomicObservation): string {
    if (point?.state === 'hidden') return HIDDEN_FIGURE;
    return point?.state === 'shown' && point.value !== null
        ? formatExactPesos(point.value)
        : NOT_AVAILABLE;
}

export function changeLabel(point?: EconomicObservation): string {
    if (point?.state === 'hidden') return HIDDEN_FIGURE;
    return point?.state === 'shown' && point.comparable && point.change !== null
        ? signedPesos.format(Number(point.change))
        : NOT_AVAILABLE;
}

export function percentageLabel(point?: EconomicObservation): string {
    if (point?.state === 'hidden') return HIDDEN_FIGURE;
    return point?.state === 'shown' &&
        point.comparable &&
        point.percentageChange !== null
        ? `${percent.format(point.percentageChange)}%`
        : NOT_AVAILABLE;
}

export function snapshotDate(value: string): string {
    return new Intl.DateTimeFormat(LOCALE, {
        dateStyle: 'long',
        timeZone: TIME_ZONE,
    }).format(new Date(`${value}T00:00:00+08:00`));
}
