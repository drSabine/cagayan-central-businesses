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
