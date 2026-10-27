import { usePage } from '@inertiajs/react';
import { Grip, Square } from 'lucide-react';
import { LazyProvinceMap } from '@/components/lazy-province-map';
import type { MapStyle } from '@/components/province-map';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
    formatFigure,
    formatNumber,
    sourceName,
    townFigures,
} from '@/lib/format';
import { pageSearchParams, replaceLocalQuery } from '@/lib/navigation';
import { home } from '@/routes';
import type { TownAtlas as Atlas } from '@/types/data';

const NONE = 'province';

export function TownAtlas({
    atlas,
    mapStyle,
    onMapStyleChange,
}: {
    atlas: Atlas;
    mapStyle: MapStyle;
    onMapStyleChange: (style: MapStyle) => void;
}) {
    const { url } = usePage();
    const townCode = pageSearchParams(url).get('town');
    const town = atlas.towns.find((item) => item.code === townCode) ?? null;
    const shown = town ?? atlas.province;
    const { rows, years, sources } = townFigures(shown.population, shown);
    const choose = (code: string | null) =>
        replaceLocalQuery(url, home, { town: code });

    return (
        <div className="dark grid gap-6 text-foreground lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-8">
            <div className="h-[28rem] md:h-[36rem] lg:h-[44rem]">
                <LazyProvinceMap
                    mapStyle={mapStyle}
                    water
                    zoomable
                    label="Population by municipality and city in Cagayan"
                    shades={Object.fromEntries(
                        atlas.towns.map((item) => [item.code, item.shade]),
                    )}
                    highlight={town ? [town.code] : []}
                    describe={(code, name) => {
                        const population = atlas.towns.find(
                            (item) => item.code === code,
                        )?.population;

                        return (
                            <span className="flex flex-col gap-0.5">
                                <span className="font-medium">{name}</span>
                                <span className="tabular-nums opacity-80">
                                    {formatFigure(population, formatNumber)}{' '}
                                    people
                                </span>
                            </span>
                        );
                    }}
                    onSelect={choose}
                    className="size-full"
                />
            </div>

            <aside className="flex flex-col gap-5 border-t border-current/15 pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
                <div className="flex items-center gap-2">
                    <Select
                        value={town?.code ?? NONE}
                        onValueChange={(value) =>
                            choose(value === NONE ? null : value)
                        }
                    >
                        <SelectTrigger
                            aria-label="Choose a town"
                            className="min-w-0 flex-1"
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={NONE}>All of Cagayan</SelectItem>
                            {atlas.towns.map((item) => (
                                <SelectItem key={item.code} value={item.code}>
                                    {item.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <ToggleGroup
                        type="single"
                        variant="outline"
                        value={mapStyle}
                        aria-label="Home map style"
                        onValueChange={(value) => {
                            if (value === 'dotted' || value === 'solid')
                                onMapStyleChange(value);
                        }}
                        className="shrink-0"
                    >
                        <ToggleGroupItem
                            value="dotted"
                            className="size-10 p-0 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                            aria-label="Dotted map"
                            title="Dotted Map"
                        >
                            <Grip aria-hidden="true" />
                        </ToggleGroupItem>
                        <ToggleGroupItem
                            value="solid"
                            className="size-10 p-0 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                            aria-label="Solid map"
                            title="Solid Map"
                        >
                            <Square
                                className="fill-current"
                                aria-hidden="true"
                            />
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>

                <section
                    aria-labelledby="town-figures-heading"
                    className="flex flex-col gap-4 rounded-lg border border-current/15 p-4"
                >
                    <div className="flex flex-col gap-1">
                        <p className="type-label text-foreground">
                            {shown.kind === 'province'
                                ? 'Province'
                                : shown.kind === 'city'
                                  ? 'City'
                                  : 'Municipality'}
                        </p>
                        <h2 id="town-figures-heading" className="type-title">
                            {shown.kind === 'province'
                                ? `Cagayan Province${shown.population ? ` (as of ${shown.population.year})` : ''}`
                                : shown.name}
                        </h2>
                    </div>

                    <dl className="flex flex-col gap-3">
                        {rows.map(({ label, value }) => (
                            <div
                                key={label}
                                className="flex items-baseline justify-between gap-4"
                            >
                                <dt className="type-label text-foreground">
                                    {label}
                                </dt>
                                <dd className="text-right font-mono text-sm tabular-nums">
                                    {value}
                                </dd>
                            </div>
                        ))}
                    </dl>

                    {shown.kind !== 'province' && years.length > 0 && (
                        <p className="type-meta text-foreground">
                            Figures as of {years.join(' and ')}.
                        </p>
                    )}

                    {sources.length > 0 && (
                        <p className="flex flex-col items-start gap-2 type-meta text-foreground">
                            Source
                            {sources.map((source) => (
                                <a
                                    key={source}
                                    href={source}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="underline underline-offset-2 hover:text-foreground"
                                >
                                    {sourceName(source)}
                                    <span className="sr-only">
                                        (opens in a new tab)
                                    </span>
                                </a>
                            ))}
                        </p>
                    )}
                </section>
            </aside>
        </div>
    );
}
