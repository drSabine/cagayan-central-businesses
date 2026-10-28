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

export function formatFinanceSource(
    source: string,
    location: string | null,
): string {
    if (!location) return source;
    const pages = location.match(/^pages?\s+(\d+)(?:\s*-\s*(\d+))?$/i);
    if (pages)
        return `${source} ${pages[2] ? `pp. ${pages[1]}-${pages[2]}` : `p. ${pages[1]}`}`;
    const cell = location.match(/^(.+)!([A-Z]+\d+(?::[A-Z]+\d+)?)$/i);
    if (cell)
        return `${source} ${cell[1].replace(/\s*\([^)]*\)/g, '').trim()}!${cell[2]}`;
    return `${source} ${location}`;
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
