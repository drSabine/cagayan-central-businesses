import { useWordcloud } from '@visx/wordcloud';
import { useEffect, useMemo, useRef, useState } from 'react';
import { WishTooltip } from '@/components/charts/wish-tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCount } from '@/lib/format';
import {
    nextWishCloudShrink,
    wishCloudHeight,
    wishCloudPadding,
    wishCloudSizes,
} from '@/lib/wish-cloud-size';
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
    const sizeInputs = useMemo(
        () =>
            words.map((word) => ({
                id: word.id,
                label: word.text,
                count: word.value,
            })),
        [words],
    );
    const [shrink, setShrink] = useState(1);
    const { sizes } = useMemo(
        () => wishCloudSizes(sizeInputs, width, shrink),
        [sizeInputs, width, shrink],
    );
    const fontSize = useMemo(
        () => (word: { id: string }) => sizes.get(word.id)?.size ?? 0,
        [sizes],
    );
    const height = wishCloudHeight(width);
    const placed = useWordcloud({
        words,
        width,
        height,
        font: 'Geist',
        fontSize,
        fontWeight: 500,
        padding: wishCloudPadding(width),
        rotate: 0,
        random: stableRandom,
    });
    // A layout that drops words is retried smaller, so the cloud never omits a
    // higher-demand wish while showing a lower one.
    const [accepted, setAccepted] = useState<typeof placed | null>(null);
    const handled = useRef(placed);
    useEffect(() => {
        if (handled.current === placed) return;
        handled.current = placed;
        if (placed.length === 0) return;
        const next =
            placed.length < words.length
                ? nextWishCloudShrink(sizeInputs, width, shrink)
                : null;
        if (next === null) setAccepted(placed);
        else setShrink(next);
    }, [placed, sizeInputs, words.length, width, shrink]);
    const [settled, setSettled] = useState(false);
    useEffect(() => {
        const timer = window.setTimeout(() => setSettled(true), 2000);
        return () => window.clearTimeout(timer);
    }, []);
    const shown = accepted ?? (settled ? placed : null);
    const itemsById = useMemo(
        () => new Map(items.map((item) => [item.id, item])),
        [items],
    );
    const { visible, unplaced } = useMemo(() => {
        const positioned = (shown ?? []) as ((typeof placed)[number] & {
            id: string;
        })[];
        const placedIds = new Set(positioned.map((word) => word.id));
        const firstMissing = words.findIndex((word) => !placedIds.has(word.id));
        const rankedAbove = new Set(
            firstMissing === -1
                ? placedIds
                : words.slice(0, firstMissing).map((word) => word.id),
        );
        return {
            visible: positioned.filter((word) => rankedAbove.has(word.id)),
            unplaced: items.filter((item) => !rankedAbove.has(item.id)),
        };
    }, [shown, words, items]);
    return (
        <div className="flex flex-col gap-3">
            {shown === null ? (
                <Skeleton
                    className="motion-reduce:animate-none"
                    style={{ height }}
                    aria-label="Arranging business phrases"
                />
            ) : (
                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="w-full"
                    role="group"
                    aria-label={`Business wishes word cloud in ${townName}`}
                >
                    <g transform={`translate(${width / 2}, ${height / 2})`}>
                        {visible.map((word) => {
                            const item = itemsById.get(word.id);
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
                                            (sizes.get(item.id)?.level ?? 0) >
                                            0.5
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
            {shown !== null && unplaced.length > 0 && (
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
        // Small width changes keep the current layout; each one restarts it.
        const observer = new ResizeObserver(([entry]) => {
            const next = Math.floor(entry.contentRect.width);
            setWidth((current) =>
                current === 0 || Math.abs(next - current) >= 24
                    ? next
                    : current,
            );
        });
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
