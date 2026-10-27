// Formatting only, no metric math (frontend.md, "Rules for numbers").

import type { TownFigure, TownProfile } from '@/types/data';

export const LOCALE = 'en-PH';

// Same zone as config('cagayan.display_timezone'), so server and browser renders match.
export const TIME_ZONE = 'Asia/Manila';

export const NOT_AVAILABLE = 'Not available';
export const HIDDEN_FIGURE = 'Hidden to protect individual businesses';

const SOURCE_NAMES: Record<string, string> = {
    'psa.gov.ph': 'Philippine Statistics Authority',
    'www.coa.gov.ph': 'Commission on Audit',
};

const countFormat = new Intl.NumberFormat(LOCALE);

const dateTimeFormat = new Intl.DateTimeFormat(LOCALE, {
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: TIME_ZONE,
});

export function formatCount(value: number): string {
    return countFormat.format(value);
}

// "October 6 at 4:12 PM", in residents' local time.
export function formatDateTime(iso: string): string {
    const parts = dateTimeFormat.formatToParts(new Date(iso));
    const part = (type: Intl.DateTimeFormatPartTypes) =>
        parts.find((p) => p.type === type)?.value ?? '';

    return `${part('month')} ${part('day')} at ${part('hour')}:${part('minute')} ${part('dayPeriod').toUpperCase()}`;
}

const decimalFormat = new Intl.NumberFormat(LOCALE, {
    maximumFractionDigits: 1,
});

// Figures arrive as decimal strings from the server (TownFigure).
export function formatNumber(value: string): string {
    return decimalFormat.format(Number(value));
}

// "₱224.7 million" or "₱1.5 billion".
export function formatPesos(value: string): string {
    const number = Number(value);

    return number >= 1_000_000_000
        ? `₱${decimalFormat.format(number / 1_000_000_000)} billion`
        : `₱${decimalFormat.format(number / 1_000_000)} million`;
}

export function formatFigure(
    figure: TownFigure | null | undefined,
    format: (value: string) => string = formatNumber,
): string {
    return figure ? format(figure.value) : NOT_AVAILABLE;
}

export function townFigures(
    population: TownFigure | null,
    finances?: Pick<TownProfile, 'revenue' | 'expenditure'> | null,
) {
    const rows = [
        {
            label: 'Population',
            value: formatFigure(population, formatNumber),
            figure: population,
        },
        {
            label: 'Government Revenue',
            value: formatFigure(finances?.revenue, formatPesos),
            figure: finances?.revenue ?? null,
        },
        {
            label: 'Government Expenses',
            value: formatFigure(finances?.expenditure, formatPesos),
            figure: finances?.expenditure ?? null,
        },
    ];
    const present = rows.flatMap(({ figure }) => (figure ? [figure] : []));

    return {
        rows,
        years: [...new Set(present.map((f) => f.year))],
        sources: [
            ...new Set(
                present.flatMap((f) => (f.sourceUrl ? [f.sourceUrl] : [])),
            ),
        ],
    };
}

export function sourceName(sourceUrl: string): string {
    const { hostname } = new URL(sourceUrl);

    return SOURCE_NAMES[hostname] ?? hostname;
}
