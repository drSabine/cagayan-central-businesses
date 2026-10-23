// Formatting only, no metric math (frontend.md, "Rules for numbers").

const LOCALE = 'en-PH';

// Same zone as config('cagayan.display_timezone'), so server and browser renders match.
const TIME_ZONE = 'Asia/Manila';

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
