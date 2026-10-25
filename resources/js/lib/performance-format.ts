import type { EconomicObservation } from '@/types/economic-performance';

const pesos = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
});
const signedPesos = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    signDisplay: 'exceptZero',
    minimumFractionDigits: 2,
});
const percent = new Intl.NumberFormat('en-PH', {
    signDisplay: 'exceptZero',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
});
const compact = new Intl.NumberFormat('en-PH', {
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
    if (point?.state === 'hidden')
        return 'Hidden to protect individual businesses';
    return point?.state === 'shown' && point.value !== null
        ? formatExactPesos(point.value)
        : 'Not available';
}

export function changeLabel(point?: EconomicObservation): string {
    if (point?.state === 'hidden')
        return 'Hidden to protect individual businesses';
    return point?.state === 'shown' && point.comparable && point.change !== null
        ? signedPesos.format(Number(point.change))
        : 'Not available';
}

export function percentageLabel(point?: EconomicObservation): string {
    if (point?.state === 'hidden')
        return 'Hidden to protect individual businesses';
    return point?.state === 'shown' &&
        point.comparable &&
        point.percentageChange !== null
        ? `${percent.format(point.percentageChange)}%`
        : 'Not available';
}

export function snapshotDate(value: string): string {
    return new Intl.DateTimeFormat('en-PH', {
        dateStyle: 'long',
        timeZone: 'Asia/Manila',
    }).format(new Date(`${value}T00:00:00+08:00`));
}
