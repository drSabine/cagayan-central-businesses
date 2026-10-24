const zone = 'Asia/Manila';
const clock = new Intl.DateTimeFormat('en-GB', {
    timeZone: zone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
});
const date = new Intl.DateTimeFormat('en-PH', {
    timeZone: zone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
});
const hour = new Intl.DateTimeFormat('en-GB', {
    timeZone: zone,
    hour: '2-digit',
    hourCycle: 'h23',
});
export const formatClock = (value: Date) => clock.format(value);
export const formatWorkspaceDate = (value: Date) => date.format(value);
export const greeting = (value: Date) => {
    const current = Number(hour.format(value));
    return current < 12
        ? 'Good morning'
        : current < 18
          ? 'Good afternoon'
          : 'Good evening';
};
