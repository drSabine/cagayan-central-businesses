export const wishCloudMinSize = 12;

type CloudWord = { id: string; label: string; count: number };

const shrinkStep = 0.9;
const averageGlyphWidth = 0.65;
const edgeSpace = 24;

// Narrow cards get more height and tighter padding so the same words fit.
export const wishCloudHeight = (width: number) =>
    Math.min(420, Math.max(280, Math.round((280 * 640) / width)));
export const wishCloudPadding = (width: number) =>
    Math.min(7, Math.max(3, Math.round(width / 90)));

// Counts are positive; the floor keeps a stray zero from reaching log(0).
const logCount = (count: number) => Math.log(Math.max(count, 1));

/**
 * Size each word by where its count sits between the smallest and largest
 * count shown on a log scale (like visx scaleLog), so any set of counts keeps
 * its order, fills the same range, and one large outlier cannot flatten the
 * rest. One shared maximum is lowered until the longest label fits the width,
 * so a long label never ends up smaller than a lower-demand short one.
 * `shrink` lowers that shared maximum again when a layout dropped words.
 */
export function wishCloudSizes(
    words: CloudWord[],
    width: number,
    shrink: number,
) {
    const logs = words.map((word) => logCount(word.count));
    const lowest = Math.min(...logs);
    const highest = Math.max(...logs);
    const levels = logs.map((value) =>
        highest === lowest ? 0.5 : (value - lowest) / (highest - lowest),
    );
    const room = width - edgeSpace - 2 * wishCloudPadding(width);
    let maximum = Math.min(56, Math.max(28, width / 20));
    words.forEach((word, index) => {
        if (levels[index] === 0) return;
        const fits = room / (averageGlyphWidth * word.label.length);
        maximum = Math.min(
            maximum,
            wishCloudMinSize + (fits - wishCloudMinSize) / levels[index],
        );
    });
    maximum = Math.max(maximum, wishCloudMinSize);
    maximum = wishCloudMinSize + (maximum - wishCloudMinSize) * shrink;
    return {
        maximum,
        sizes: new Map(
            words.map((word, index) => [
                word.id,
                {
                    size:
                        wishCloudMinSize +
                        levels[index] * (maximum - wishCloudMinSize),
                    level: levels[index],
                },
            ]),
        ),
    };
}

// Next smaller step to retry when words did not fit, or null once the sizes
// would no longer be distinguishable.
export function nextWishCloudShrink(
    words: CloudWord[],
    width: number,
    shrink: number,
) {
    const next = shrink * shrinkStep;
    return wishCloudSizes(words, width, next).maximum >= wishCloudMinSize * 1.5
        ? next
        : null;
}
