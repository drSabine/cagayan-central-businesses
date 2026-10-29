import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { BirMark } from '@/components/business-badges';
import { CategoryIcon } from '@/components/category-icon';
import { LazyBusinessMap } from '@/components/map/lazy-business-map';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Toggle } from '@/components/ui/toggle';
import { pageSearchParams } from '@/lib/navigation';
import {
    businessQuery,
    PAGE_SIZE,
    parseBusinessView,
    visibleBusinesses,
} from '@/lib/public-businesses';
import type { BusinessView, TownBusinesses } from '@/lib/public-businesses';
import { index, show } from '@/routes/public/businesses';
import { index as suggestions } from '@/routes/public/wishes';

// One request per town for the whole visit; revisiting a town or changing any other filter asks the server for nothing.
const towns = new Map<string, TownBusinesses>();

type Directory = {
    towns: { value: string; label: string }[];
    categories: { code: string; name: string; color: number }[];
};

export default function PublicBusinesses({
    directory,
    businesses,
}: {
    directory: Directory;
    businesses: TownBusinesses | null;
}) {
    const { url } = usePage();
    const view = parseBusinessView(
        pageSearchParams(url),
        directory.towns,
        businesses?.barangays ?? [],
        directory.categories,
    );
    const town =
        businesses && businesses.town === view.town ? businesses : null;
    const [search, setSearch] = useState(view.q);
    const [highlight, setHighlight] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [failed, setFailed] = useState(false);
    const categories = Object.fromEntries(
        directory.categories.map((c) => [c.code, c]),
    );
    const barangayName = Object.fromEntries(
        (town?.barangays ?? []).map((b) => [b.value, b.label]),
    );
    const rows = town ? visibleBusinesses(town.rows, view) : [];

    if (businesses) towns.set(businesses.town, businesses);

    const go = (patch: Partial<BusinessView>, replace = false) => {
        const visit = {
            url: index({
                query: businessQuery({ ...view, shown: PAGE_SIZE, ...patch }),
            }).url,
            preserveState: true,
            preserveScroll: true,
        };
        if (replace) router.replace(visit);
        else router.push(visit);
    };

    const chooseTown = (code: string) => {
        const next = {
            ...view,
            town: code,
            barangay: null,
            q: '',
            shown: PAGE_SIZE,
        };
        const target = index({ query: businessQuery(next) }).url;
        const cached = towns.get(code);
        setSearch('');
        setFailed(false);
        if (cached) {
            router.push({
                url: target,
                preserveState: true,
                preserveScroll: true,
                props: (props) => ({ ...props, businesses: cached }),
            });
            return;
        }
        setLoading(true);
        router.get(
            target,
            {},
            {
                only: ['businesses'],
                preserveState: true,
                preserveScroll: true,
                onError: () => setFailed(true),
                onNetworkError: () => setFailed(true),
                onHttpException: () => setFailed(true),
                onFinish: () => setLoading(false),
            },
        );
    };

    useEffect(() => {
        if (search === view.q) return;
        const timer = setTimeout(() => go({ q: search }, true), 250);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const choose = (
        label: string,
        value: string | null,
        options: { value: string; label: string }[],
        onChange: (value: string | null) => void,
        all?: string,
    ) => (
        <Select
            value={value ?? 'all'}
            onValueChange={(next) => onChange(next === 'all' ? null : next)}
            disabled={!town && !!all}
        >
            <SelectTrigger aria-label={label} className="w-full sm:w-52">
                <SelectValue placeholder={label} />
            </SelectTrigger>
            <SelectContent>
                {all && <SelectItem value="all">{all}</SelectItem>}
                {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );

    return (
        <>
            <Head title="Businesses" />
            <div className="flex flex-col gap-4">
                <h1 className="type-title">Businesses</h1>
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                    <Select
                        value={view.town ?? undefined}
                        onValueChange={chooseTown}
                    >
                        <SelectTrigger
                            aria-label="Town"
                            className="w-full sm:w-56"
                        >
                            <SelectValue placeholder="Choose a Town" />
                        </SelectTrigger>
                        <SelectContent>
                            {directory.towns.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Input
                        type="search"
                        aria-label="Search by name"
                        placeholder="Search by name"
                        value={search}
                        maxLength={60}
                        disabled={!town}
                        className="sm:w-56"
                        onChange={(event) => setSearch(event.target.value)}
                    />
                    {choose(
                        'Barangay',
                        view.barangay,
                        town?.barangays ?? [],
                        (barangay) => go({ barangay }),
                        'All Barangays',
                    )}
                    {choose(
                        'Category',
                        view.category,
                        directory.categories.map((c) => ({
                            value: c.code,
                            label: c.name,
                        })),
                        (category) => go({ category }),
                        'All Categories',
                    )}
                    <div className="flex gap-2">
                        <Toggle
                            variant="outline"
                            disabled={!town}
                            pressed={view.isNew}
                            onPressedChange={(isNew) => go({ isNew })}
                        >
                            New This Year
                        </Toggle>
                        <Toggle
                            variant="outline"
                            disabled={!town}
                            pressed={view.bir}
                            onPressedChange={(bir) => go({ bir })}
                        >
                            BIR Registered
                        </Toggle>
                        {town && (
                            <Button
                                variant="outline"
                                className="lg:hidden"
                                onClick={() => go({ map: !view.map })}
                            >
                                {view.map ? 'Show List' : 'Show Map'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {!view.town || (!town && !loading && !failed) ? (
                <p className="rounded-sm border bg-card p-6 type-body text-muted-foreground">
                    Choose a town to see its registered businesses.
                </p>
            ) : failed ? (
                <div
                    role="alert"
                    className="flex flex-wrap items-center gap-3 rounded-sm border bg-card p-6 type-body"
                >
                    Businesses could not load.
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => chooseTown(view.town as string)}
                    >
                        Try Again
                    </Button>
                </div>
            ) : (
                <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                    <div
                        className={
                            view.map
                                ? 'hidden lg:flex lg:flex-col lg:gap-3'
                                : 'flex flex-col gap-3'
                        }
                    >
                        {!town || loading ? (
                            <div
                                className="flex flex-col gap-2"
                                aria-busy="true"
                            >
                                {Array.from({ length: 6 }, (_, i) => (
                                    <Skeleton
                                        key={i}
                                        className="h-16 w-full rounded-sm"
                                    />
                                ))}
                            </div>
                        ) : rows.length === 0 ? (
                            <p className="rounded-sm border bg-card p-6 type-body text-muted-foreground">
                                {town.rows.length === 0
                                    ? 'No registered businesses here yet.'
                                    : 'No businesses match these filters.'}
                            </p>
                        ) : (
                            <ul className="divide-y rounded-sm border bg-card">
                                {rows.slice(0, view.shown).map((row) => {
                                    const category = categories[row.category];
                                    return (
                                        <li
                                            key={row.id}
                                            onMouseEnter={() =>
                                                setHighlight(row.id)
                                            }
                                            onMouseLeave={() =>
                                                setHighlight(null)
                                            }
                                        >
                                            <Link
                                                href={show(row.id)}
                                                onFocus={() =>
                                                    setHighlight(row.id)
                                                }
                                                className="flex items-center gap-3 px-4 py-3 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                            >
                                                {category && (
                                                    <CategoryIcon
                                                        code={category.code}
                                                        name={category.name}
                                                    />
                                                )}
                                                <span className="flex min-w-0 flex-1 flex-col">
                                                    <span className="truncate type-item">
                                                        {row.name}
                                                    </span>
                                                    <span className="truncate type-meta">
                                                        {
                                                            barangayName[
                                                                row.barangay
                                                            ]
                                                        }
                                                        , {town.townName}
                                                    </span>
                                                </span>
                                                {row.bir && <BirMark />}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                        {rows.length > view.shown && (
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() =>
                                    go({ shown: view.shown + PAGE_SIZE }, true)
                                }
                            >
                                Show More
                            </Button>
                        )}
                        {view.barangay && town && (
                            <p className="type-body">
                                Missing a business in{' '}
                                {barangayName[view.barangay]}?{' '}
                                <Link
                                    href={suggestions()}
                                    className="underline underline-offset-2"
                                >
                                    Suggest One
                                </Link>
                            </p>
                        )}
                    </div>
                    <div
                        className={`h-[calc(100vh-8rem)] min-h-[28rem] lg:sticky lg:top-6 ${view.map ? '' : 'hidden lg:block'}`}
                    >
                        {view.town && (
                            <LazyBusinessMap
                                townCode={view.town}
                                barangay={view.barangay}
                                businesses={rows}
                                highlight={highlight}
                                onSelect={(id) => router.visit(show(id))}
                                label="Map of registered businesses"
                            />
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
