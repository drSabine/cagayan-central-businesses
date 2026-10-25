export function mapColor(token: string): string {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('Color conversion unavailable');
    context.fillStyle = getComputedStyle(document.documentElement)
        .getPropertyValue(token)
        .trim();
    context.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a / 255 + ')';
}
