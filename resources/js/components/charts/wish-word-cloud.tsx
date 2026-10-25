import { useWordcloud } from '@visx/wordcloud';
import { useEffect, useMemo, useRef, useState } from 'react';
import { WishTooltip } from '@/components/charts/wish-tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCount } from '@/lib/format';
import type { WishAggregate } from '@/types/economic-performance';

const stableRandom = () => 0.5;

function CloudLayout({
    items,
    width,
    townName,
    cloudLimit,
}: {
    items: WishAggregate[];
    width: number;
    townName: string;
    cloudLimit: number;
}) {
    // Stable inputs prevent restarting the asynchronous layout after each result.
    const words = useMemo(
        () =>
            items.slice(0, cloudLimit).map((item) => ({
                id: item.id,
                text: item.label,
                value: item.count,
            })),
        [items, cloudLimit],
    );
    const fontSize = useMemo(
        () => (word: { text: string; value: number }) =>
            Math.max(
                12,
                Math.min(
                    54,
                    (14 + Math.sqrt(word.value) * 4) * Math.min(1, width / 640),
                    (width - 24) / (word.text.length * 0.65),
                ),
            ),
        [width],
    );
    const placed = useWordcloud({
        words,
        width,
        height: 280,
        font: 'Geist',
        fontSize,
        fontWeight: 500,
        padding: 7,
        rotate: 0,
        random: stableRandom,
    });
    const [settled, setSettled] = useState(false);
    useEffect(() => {
        const timer = window.setTimeout(() => setSettled(true), 2000);
        return () => window.clearTimeout(timer);
    }, []);
    const positioned = placed as ((typeof placed)[number] & { id: string })[];
    const placedIds = new Set(positioned.map((word) => word.id));
    const unplaced = items.filter((item) => !placedIds.has(item.id));
    return (
        <div className="flex flex-col gap-3">
            {!settled && placed.length === 0 ? (
                <Skeleton
                    className="h-72 motion-reduce:animate-none"
                    aria-label="Arranging business phrases"
                />
            ) : (
                <svg
                    viewBox={`0 0 ${width} 280`}
                    className="h-72 w-full"
                    role="group"
                    aria-label={`Business wishes word cloud in ${townName}`}
                >
                    <g transform={`translate(${width / 2}, 140)`}>
                        {positioned.map((word, index) => {
                            const item = items.find(
                                (entry) => entry.id === word.id,
                            );
                            if (!item) return null;
                            return (
                                <WishTooltip
                                    key={item.id}
                                    item={item}
                                    townName={townName}
                                >
                                    <text
                                        transform={`translate(${word.x}, ${word.y})`}
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        fontFamily="Geist"
                                        fontSize={word.size}
                                        fontWeight={500}
                                        fill={
                                            Number(word.size) >= 24 &&
                                            index % 2 === 0
                                                ? 'var(--chart-2)'
                                                : 'var(--foreground)'
                                        }
                                        tabIndex={0}
                                        role="img"
                                        aria-label={`${item.label}: ${formatCount(item.count)} wishes in ${townName}`}
                                        className="cursor-default outline-none focus:fill-foreground focus:underline"
                                    >
                                        {item.label}
                                    </text>
                                </WishTooltip>
                            );
                        })}
                    </g>
                </svg>
            )}
            {(settled || placed.length > 0) && unplaced.length > 0 && (
                <ul
                    className="flex max-h-48 flex-wrap gap-2 overflow-y-auto"
                    aria-label="More Business Wishes"
                >
                    {unplaced.map((item) => (
                        <li key={item.id} className="max-w-full">
                            <WishTooltip item={item} townName={townName}>
                                <span
                                    tabIndex={0}
                                    className="inline-flex min-h-10 max-w-full cursor-default items-center gap-3 rounded-sm border px-3 py-2 type-body focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                    aria-label={`${item.label}: ${formatCount(item.count)} wishes in ${townName}`}
                                >
                                    <span className="min-w-0 wrap-anywhere">
                                        {item.label}
                                    </span>
                                    <span className="shrink-0 font-mono tabular-nums">
                                        {formatCount(item.count)}
                                    </span>
                                </span>
                            </WishTooltip>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default function WishWordCloud({
    items,
    townName,
    cloudLimit,
}: {
    items: WishAggregate[];
    townName: string;
    cloudLimit: number;
}) {
    const container = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(0);
    const [fontsReady, setFontsReady] = useState(false);
    useEffect(() => {
        let active = true;
        void document.fonts.ready.then(() => {
            if (active) setFontsReady(true);
        });
        const element = container.current;
        if (!element) return;
        const observer = new ResizeObserver(([entry]) =>
            setWidth(Math.floor(entry.contentRect.width)),
        );
        observer.observe(element);
        return () => {
            active = false;
            observer.disconnect();
        };
    }, []);
    return (
        <div ref={container} className="min-w-0">
            {fontsReady && width > 0 ? (
                <CloudLayout
                    key={width}
                    items={items}
                    width={width}
                    townName={townName}
                    cloudLimit={cloudLimit}
                />
            ) : (
                <Skeleton
                    className="h-72 motion-reduce:animate-none"
                    aria-label="Loading word cloud"
                />
            )}
        </div>
    );
}
