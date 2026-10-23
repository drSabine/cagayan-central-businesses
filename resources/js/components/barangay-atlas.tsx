import { router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { LazyProvinceMap } from '@/components/lazy-province-map';
import type { MapStyle } from '@/components/province-map';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { formatCount } from '@/lib/format';
import { home } from '@/routes';
import type { TownProfile } from '@/types/data';

const datasets = import.meta.glob('../../../data/barangays/maps/*.json', {
    query: '?raw',
    import: 'default',
});
type Census = {
    year: number;
    source: string;
    features: {
        properties: {
            psgc_code: string;
            name: string;
            population: number;
            shade: number;
        };
    }[];
};

type LoadedCensus = {
    code: string;
    source: string;
    census: Census;
    barangays: Map<string, Census['features'][number]['properties']>;
    shades: Record<string, number>;
};

const censusCache = new Map<string, LoadedCensus>();
const pendingCensuses = new Map<string, Promise<LoadedCensus>>();

function loadCensus(code: string): Promise<LoadedCensus> {
    const cached = censusCache.get(code);
    if (cached) return Promise.resolve(cached);
    const pending = pendingCensuses.get(code);
    if (pending) return pending;
    const load = datasets[`../../../data/barangays/maps/${code}.json`];
    if (!load) return Promise.reject(new Error('No census dataset'));
    const request = load()
        .then((raw) => {
            const census = JSON.parse(raw as string) as Census;
            const loaded = {
                code,
                source: raw as string,
                census,
                barangays: new Map(
                    census.features.map(({ properties }) => [
                        properties.psgc_code,
                        properties,
                    ]),
                ),
                shades: Object.fromEntries(
                    census.features.map(({ properties }) => [
                        properties.psgc_code,
                        properties.shade,
                    ]),
                ),
            };
            censusCache.set(code, loaded);
            return loaded;
        })
        .finally(() => pendingCensuses.delete(code));
    pendingCensuses.set(code, request);
    return request;
}

export function BarangayAtlas({
    towns,
    mapStyle,
}: {
    towns: TownProfile[];
    mapStyle: MapStyle;
}) {
    const { url } = usePage();
    const params = new URL(url, 'http://localhost').searchParams;
    const requested = params.get('barangayTown');
    const town =
        towns.find((item) => item.code === requested) ??
        towns.find((item) => item.code === '0201529000');
    const townCode = town?.code;
    const [loaded, setLoaded] = useState<LoadedCensus | null>(null);
    const [failedTown, setFailedTown] = useState<string | null>(null);
    const [attempt, setAttempt] = useState(0);
    const [selections, setSelections] = useState<Record<string, string>>({});
    const chosen = townCode ? (selections[townCode] ?? '') : '';
    useEffect(() => {
        if (!townCode) return;
        let active = true;
        setFailedTown(null);
        loadCensus(townCode)
            .then((census) => {
                if (active) setLoaded(census);
            })
            .catch(() => {
                if (active) setFailedTown(townCode);
            });
        return () => {
            active = false;
        };
    }, [townCode, attempt]);
    const current =
        loaded?.code === townCode
            ? loaded
            : (censusCache.get(townCode ?? '') ?? null);
    const picked = current?.barangays.get(chosen);
    if (!town)
        return <p className="type-body">No town population is available.</p>;
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <label htmlFor="population-town" className="type-label">
                    Town
                </label>
                <div className="flex items-center gap-2">
                    <Select
                        value={town.code}
                        onValueChange={(code) => {
                            params.set('barangayTown', code);
                            router.replace({
                                url: home({ query: Object.fromEntries(params) })
                                    .url,
                                preserveState: true,
                                preserveScroll: true,
                            });
                        }}
                    >
                        <SelectTrigger
                            id="population-town"
                            className="min-w-0 flex-1"
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {towns.map((item) => (
                                <SelectItem key={item.code} value={item.code}>
                                    {item.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            {failedTown === townCode ? (
                <div role="alert" className="flex flex-col gap-3">
                    <p>Could not load the barangay map.</p>
                    <Button
                        variant="outline"
                        onClick={() => setAttempt(attempt + 1)}
                    >
                        Try Again
                    </Button>
                </div>
            ) : !current ? (
                <Skeleton
                    aria-label="Loading barangay population"
                    role="status"
                    className="h-64 lg:h-72"
                />
            ) : (
                <>
                    <div className="h-64 text-primary lg:h-72">
                        <LazyProvinceMap
                            key={town.code}
                            source={current.source}
                            mapStyle={mapStyle}
                            label={`Barangay population in ${town.name}, 2024`}
                            shades={current.shades}
                            highlight={chosen ? [chosen] : []}
                            describe={(code, name) => (
                                <span>
                                    {name}:{' '}
                                    {formatCount(
                                        current.barangays.get(code)!.population,
                                    )}{' '}
                                    people
                                </span>
                            )}
                            onSelect={(code) =>
                                setSelections((previous) => ({
                                    ...previous,
                                    [town.code]:
                                        previous[town.code] === code
                                            ? ''
                                            : code,
                                }))
                            }
                            className="size-full"
                        />
                    </div>
                    <div className="min-h-6">
                        {picked && (
                            <p className="flex items-baseline justify-between gap-3">
                                <span
                                    className="truncate type-item"
                                    title={picked.name}
                                >
                                    {picked.name}
                                </span>
                                <span className="shrink-0 font-mono tabular-nums">
                                    {formatCount(picked.population)} people
                                </span>
                            </p>
                        )}
                    </div>
                    <div className="flex items-baseline gap-2 border-t pt-3 type-meta text-foreground">
                        <span>Source</span>
                        <a
                            href={current.census.source}
                            target="_blank"
                            rel="noreferrer"
                            className="underline underline-offset-2"
                        >
                            Philippine Statistics Authority
                            <span className="sr-only">
                                {' '}
                                (opens in a new tab)
                            </span>
                        </a>
                    </div>
                </>
            )}
        </div>
    );
}
