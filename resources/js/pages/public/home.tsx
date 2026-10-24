import { Head, Link } from '@inertiajs/react';
import { ClipboardList, Map as MapIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { MapStyle } from '@/components/province-map';
import { DefinitionList } from '@/components/definition-list';
import { BarangayAtlas } from '@/components/barangay-atlas';
import { TownAtlas } from '@/components/town-atlas';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { formatCount } from '@/lib/format';
import { index as suggestions } from '@/routes/public/wishes';
import type { HomeOverview } from '@/types/data';

type Props = {
    overview: HomeOverview;
};

// The business map (P1) and the guide (P4) move into the open card when they are built.
const upcoming = [
    {
        icon: MapIcon,
        title: 'Business Map',
        description: 'Registered businesses in each barangay, by type.',
    },
    {
        icon: ClipboardList,
        title: 'Start a Business Guide',
        description:
            'The permits and documents your business needs, and where to get them.',
    },
];

export default function Home({ overview }: Props) {
    const [mapStyle, setMapStyle] = useState<MapStyle>('dotted');
    useEffect(() => {
        try {
            const stored = localStorage.getItem('map-style');
            if (stored === 'solid' || stored === 'dotted') setMapStyle(stored);
        } catch {
            /* Storage may be disabled; the control still works for this visit. */
        }
    }, []);
    const chooseMapStyle = (style: MapStyle) => {
        setMapStyle(style);
        try {
            localStorage.setItem('map-style', style);
        } catch {
            /* Keep the in-memory preference. */
        }
    };
    return (
        <>
            <Head title="Home" />

            <div className="flex flex-col">
                <section className="overflow-hidden rounded-2xl bg-brand text-brand-foreground">
                    {/* Kept for screen readers and the document outline. The map is the visible hero. */}
                    <h1 className="sr-only">See where Cagayan does business</h1>
                    <div className="px-5 py-6 md:px-8">
                        <TownAtlas
                            atlas={overview.atlas}
                            mapStyle={mapStyle}
                            onMapStyleChange={chooseMapStyle}
                        />
                    </div>
                </section>
            </div>

            <section
                id="about-data"
                aria-labelledby="about-data-heading"
                className="grid reveal scroll-mt-6 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-10"
            >
                <div className="flex flex-col gap-4">
                    <h2 id="about-data-heading" className="type-heading">
                        About the Data
                    </h2>
                    <BarangayAtlas
                        towns={overview.atlas.towns}
                        mapStyle={mapStyle}
                    />
                </div>
                <DefinitionList
                    items={[
                        {
                            term: 'Town Figures',
                            description: (
                                <>
                                    Population:{' '}
                                    <a
                                        href="https://psa.gov.ph/statistics/population-and-housing/node/1684077888"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="underline underline-offset-2"
                                    >
                                        PSA 2024 Census of Population
                                        <span className="sr-only">
                                            {' '}
                                            (opens in a new tab)
                                        </span>
                                    </a>
                                    . Government revenue and expenses: verified
                                    municipal and city financial statements
                                    published by the Commission on Audit.
                                </>
                            ),
                        },
                        {
                            term: 'Records',
                            description:
                                'Population and geographic boundaries come from published sources. Business records are not available in this foundation.',
                        },
                        {
                            term: 'Area',
                            description:
                                'Cagayan’s 28 municipalities and Tuguegarao City.',
                        },
                        {
                            term: 'Period',
                            description:
                                'Official figures retain their source reference years.',
                        },
                        {
                            term: 'Businesses',
                            description:
                                'Business records are planned for a later phase.',
                        },
                        {
                            term: 'Sales',
                            description:
                                'Individual business sales are not displayed. Future public sales summaries require disclosure controls.',
                        },
                        {
                            term: 'Boundaries',
                            description:
                                'Simplified 2023 PSGC boundaries paired with 2024 census populations. For geographic comparison only; not for surveying or determining legal boundaries.',
                        },
                    ]}
                />
            </section>

            <section
                aria-labelledby="protection"
                className="grid reveal gap-6 rounded-2xl bg-muted p-6 md:p-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-10"
            >
                <h2 id="protection" className="type-heading">
                    How Businesses Are Protected
                </h2>
                <ol className="flex flex-col gap-4">
                    {[
                        'Individual business sales are excluded from public and administrative responses. Only aggregates that satisfy disclosure controls may be published.',
                        `Aggregate sales for fewer than ${formatCount(overview.smallGroupMin)} businesses are withheld. Additional controls prevent disclosure through dominant contributions or related totals.`,
                        'Public pages exclude owner names and contact details. Suggestions do not request these details; submission records use hashed identifiers instead of raw IP addresses.',
                    ].map((point, index) => (
                        <li key={point} className="flex gap-5">
                            <span
                                aria-hidden="true"
                                className="font-mono text-2xl leading-none text-muted-foreground tabular-nums"
                            >
                                {index + 1}
                            </span>
                            <p className="type-lead">{point}</p>
                        </li>
                    ))}
                </ol>
            </section>

            <section
                aria-labelledby="tasks"
                className="flex reveal flex-col gap-5"
            >
                <h2 id="tasks" className="type-heading">
                    What You Can Do
                </h2>
                <div className="grid gap-4 lg:grid-cols-3">
                    <Card className="gap-5 lg:col-span-2 lg:row-span-2">
                        <CardHeader>
                            <CardTitle className="type-title">
                                What Business Do You Wish for Your Town?
                            </CardTitle>
                        </CardHeader>
                        <CardFooter className="flex flex-wrap gap-3">
                            <Button asChild>
                                <Link href={suggestions()}>
                                    Share Your Wish
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    {upcoming.map((item) => (
                        <Card
                            key={item.title}
                            className="gap-3 bg-muted py-5 shadow-none"
                        >
                            <CardHeader className="px-5">
                                <div className="flex items-center justify-between gap-3">
                                    <CardTitle className="flex items-center gap-2">
                                        <item.icon
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                        {item.title}
                                    </CardTitle>
                                    <Badge variant="outline">
                                        Not Open Yet
                                    </Badge>
                                </div>
                                <CardDescription>
                                    {item.description}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </section>
        </>
    );
}
