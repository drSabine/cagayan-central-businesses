import { usePage } from '@inertiajs/react';
import {
    lazy,
    Suspense,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import townsRaw from '../../../../data/boundaries/cagayan-municipalities.geojson?raw';
import {
    useInBrowser,
    VisualErrorBoundary,
} from '@/components/lazy-province-map';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { sourceName, townFigures } from '@/lib/format';
import { loadTownBoundaries } from '@/lib/map-data';
import type { AreaCollection } from '@/lib/map-data';
import { pageSearchParams } from '@/lib/navigation';
import { navigateDashboard } from '@/lib/workspace-map-navigation';
import type { WorkspaceMap } from '@/types/workspace';

const EconomicMap = lazy(() => import('@/components/map/economic-map'));
const townGeometry = JSON.parse(townsRaw) as AreaCollection;

export function DashboardAtlas({ data }: { data: WorkspaceMap }) {
    const { url } = usePage();
    const inBrowser = useInBrowser();
    const params = pageSearchParams(url);
    const townCode = params.get('town');
    const drilling = params.get('level') === 'barangays';
    const barangayCode = params.get('barangay');
    const town =
        data.atlas.towns.find((item) => item.code === townCode) ?? null;
    const barangay =
        data.barangays.find((item) => item.code === barangayCode) ?? null;
    const shown = barangay ?? town ?? data.atlas.province;
    const [loaded, setLoaded] = useState<{
        code: string;
        source: AreaCollection;
    } | null>(null);
    const [failed, setFailed] = useState<string | null>(null);
    useEffect(() => {
        if (!drilling || !townCode) return;
        let active = true;
        setFailed(null);
        loadTownBoundaries(townCode)
            .then((source) => {
                if (active) setLoaded({ code: townCode, source });
            })
            .catch(() => {
                if (active) setFailed(townCode);
            });
        return () => {
            active = false;
        };
    }, [townCode, drilling]);
    const source = useMemo<AreaCollection>(
        () => ({
            ...townGeometry,
            features: townGeometry.features.map((feature) => ({
                ...feature,
                properties: {
                    ...feature.properties,
                    shade:
                        data.atlas.towns.find(
                            (item) =>
                                item.code === feature.properties.psgc_code,
                        )?.shade ?? null,
                },
            })),
        }),
        [data.atlas],
    );
    const [navigating, setNavigating] = useState(false);
    const navigate = useCallback(
        async (
            townValue: string | null,
            level?: string,
            barangayValue?: string,
        ) => {
            setNavigating(true);
            setFailed(null);
            try {
                await navigateDashboard(townValue, level, barangayValue);
            } catch {
                setFailed(townValue);
            } finally {
                setNavigating(false);
            }
        },
        [],
    );
    const chooseMap = useCallback(
        (code: string) => {
            if (drilling && townCode)
                void navigate(townCode, 'barangays', code);
            else void navigate(code);
        },
        [drilling, townCode, navigate],
    );
    const { rows, years, sources } = townFigures(
        shown.population,
        barangay ? null : (town ?? data.atlas.province),
    );
    const pending = navigating || (drilling && loaded?.code !== townCode);

    return (
        <section
            className="flex min-w-0 flex-col gap-3"
            aria-labelledby="economic-map-heading"
        >
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 id="economic-map-heading" className="type-heading">
                    Economic Map
                </h1>
            </div>
            <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
                <div
                    className="relative h-(--workspace-map-height)"
                    aria-busy={pending}
                >
                    {!inBrowser ? (
                        <Skeleton className="h-full w-full" />
                    ) : failed !== null ? (
                        <div
                            role="alert"
                            className="flex h-full flex-col items-center justify-center gap-3 border p-4 type-body"
                        >
                            <p>Boundary data could not load.</p>
                            <Button
                                variant="outline"
                                onClick={() =>
                                    void navigate(failed, 'barangays')
                                }
                            >
                                Try Again
                            </Button>
                        </div>
                    ) : (
                        <VisualErrorBoundary
                            fallback={
                                <p
                                    role="status"
                                    className="flex h-full items-center justify-center border bg-muted p-4 type-body"
                                >
                                    The map could not load. Use the area
                                    selectors and data panel.
                                </p>
                            }
                        >
                            <Suspense
                                fallback={
                                    <Skeleton className="h-full w-full" />
                                }
                            >
                                <EconomicMap
                                    source={
                                        drilling && loaded?.code === townCode
                                            ? loaded.source
                                            : source
                                    }
                                    selected={
                                        drilling ? barangayCode : townCode
                                    }
                                    onSelect={chooseMap}
                                />
                            </Suspense>
                        </VisualErrorBoundary>
                    )}
                </div>
                <aside className="flex flex-col gap-4 rounded-sm border bg-card p-4">
                    <div className="flex flex-col gap-2">
                        <label id="town-label" className="type-label">
                            Town or City
                        </label>
                        <Select
                            value={townCode ?? 'all'}
                            onValueChange={(code) =>
                                navigate(code === 'all' ? null : code)
                            }
                        >
                            <SelectTrigger
                                aria-labelledby="town-label"
                                className="w-full"
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All of Cagayan
                                </SelectItem>
                                {data.atlas.towns.map((item) => (
                                    <SelectItem
                                        key={item.code}
                                        value={item.code}
                                    >
                                        {item.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {town && !drilling && (
                            <Button
                                variant="outline"
                                onClick={() => navigate(town.code, 'barangays')}
                            >
                                View Barangays
                            </Button>
                        )}
                        {drilling && (
                            <>
                                <label
                                    id="barangay-label"
                                    className="mt-2 type-label"
                                >
                                    Barangay
                                </label>
                                <Select
                                    value={barangayCode ?? 'all'}
                                    onValueChange={(code) =>
                                        navigate(
                                            townCode,
                                            'barangays',
                                            code === 'all' ? undefined : code,
                                        )
                                    }
                                >
                                    <SelectTrigger
                                        aria-labelledby="barangay-label"
                                        className="w-full"
                                    >
                                        <SelectValue placeholder="Choose a Barangay" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Barangays
                                        </SelectItem>
                                        {data.barangays.map((item) => (
                                            <SelectItem
                                                key={item.code}
                                                value={item.code}
                                            >
                                                {item.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </>
                        )}
                    </div>
                    <div className="border-t pt-3">
                        <h2 className="type-item">{shown.name}</h2>
                        <dl className="mt-3 flex flex-col gap-3">
                            {rows.map(({ label, value }) => (
                                <div key={label}>
                                    <dt className="type-label text-muted-foreground">
                                        {label}
                                    </dt>
                                    <dd className="mt-1 font-mono type-body tabular-nums">
                                        {value}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                        {years.length > 0 && (
                            <p className="mt-3 type-meta">
                                Figures as of {years.join(' and ')}.
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2 border-t pt-3 type-meta">
                        <span>Population</span>
                        <span>Low</span>
                        <div className="flex gap-0.5" aria-hidden="true">
                            {[
                                'bg-map-1',
                                'bg-map-2',
                                'bg-map-3',
                                'bg-map-4',
                                'bg-map-5',
                            ].map((color) => (
                                <span
                                    key={color}
                                    className={color + ' h-3 w-4'}
                                />
                            ))}
                        </div>
                        <span>High</span>
                    </div>
                    {sources.length > 0 && (
                        <div className="flex flex-col gap-1 type-meta">
                            <span>Source</span>
                            {sources.map((sourceUrl) => (
                                <a
                                    key={sourceUrl}
                                    href={sourceUrl}
                                    rel="noreferrer"
                                    target="_blank"
                                    className="break-words underline underline-offset-2"
                                >
                                    {sourceName(sourceUrl)}
                                    <span className="sr-only">
                                        {' '}
                                        (opens in a new tab)
                                    </span>
                                </a>
                            ))}
                        </div>
                    )}
                </aside>
            </div>
        </section>
    );
}
