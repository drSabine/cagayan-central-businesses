import {
    HIDDEN_FIGURE,
    LOCALE,
    NOT_AVAILABLE,
    TIME_ZONE,
    formatCount,
} from '@/lib/format';
import type {
    EconomicObservation,
    MetricUnit,
} from '@/types/economic-performance';

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
const share = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 2 });
const signedNumber = new Intl.NumberFormat(LOCALE, {
    signDisplay: 'exceptZero',
    maximumFractionDigits: 2,
});

const REASONS: Record<string, string> = {
    not_published: 'COA has not published this report',
    not_reported: 'Not in the COA report for this year',
    not_collected: 'The COA workbook for this year has not been added yet',
    pending_review: 'Awaiting sign-off',
    small_group: 'Too few businesses in this group',
    dominance: 'One business holds most of this total',
    complementary: 'Hidden so another hidden figure cannot be worked out',
};

export function formatMetricValue(value: string, unit: MetricUnit): string {
    if (unit === 'percent') return `${share.format(Number(value))}%`;
    if (unit === 'count') return formatCount(Number(value));
    return formatExactPesos(value);
}

export function formatMetricTick(value: number, unit: MetricUnit): string {
    if (unit === 'percent') return `${compact.format(value)}%`;
    if (unit === 'count') return compact.format(value);
    return formatPesoTick(value);
}

export function reasonLabel(point?: EconomicObservation): string | null {
    return point?.reason ? (REASONS[point.reason] ?? null) : null;
}

/** Coverage for a Sum of Reporting Towns (M27), the census behind a per-resident value (M25), a restated year (M26), or why a value is missing. */
export function observationNote(point?: EconomicObservation): string | null {
    if (point?.coverage) {
        const { reporting, total, matched } = point.coverage;
        const towns = `${reporting} of ${total} towns`;
        return point.change === null
            ? towns
            : `${towns}, change over ${matched} reporting both years`;
    }
    if (point?.censusYear) return `Using the ${point.censusYear} census`;
    if (point?.restatedIn) return `Restated in the ${point.restatedIn} report`;
    return reasonLabel(point);
}

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

export function observationLabel(
    point?: EconomicObservation,
    unit: MetricUnit = 'php',
): string {
    if (point?.state === 'hidden') return HIDDEN_FIGURE;
    if (point?.band) return point.band;
    return point?.state === 'shown' && point.value !== null
        ? formatMetricValue(point.value, unit)
        : NOT_AVAILABLE;
}

export function changeLabel(
    point?: EconomicObservation,
    unit: MetricUnit = 'php',
): string {
    if (point?.state === 'hidden') return HIDDEN_FIGURE;
    if (point?.state !== 'shown' || !point.comparable || point.change === null)
        return NOT_AVAILABLE;
    const change = Number(point.change);
    if (unit === 'percent') return `${signedNumber.format(change)} points`;
    if (unit === 'count') return signedNumber.format(change);
    return signedPesos.format(change);
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
