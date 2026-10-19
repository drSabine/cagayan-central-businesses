import { Head, Link } from '@inertiajs/react';
import { ArrowRight, ClipboardList, Map as MapIcon } from 'lucide-react';
import { DefinitionList } from '@/components/definition-list';
import { FigureRow } from '@/components/figure-row';
import { LazyProvinceMap } from '@/components/lazy-province-map';
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
        title: 'Business map',
        description: 'Registered businesses in each barangay, by type.',
    },
    {
        icon: ClipboardList,
        title: 'Start a business guide',
        description:
            'The permits and documents your business needs, and where to get them.',
    },
];

export default function Home({ overview }: Props) {
    return (
        <>
            <Head title="Home" />

            <div className="flex flex-col">
                <section className="overflow-hidden rounded-2xl bg-brand text-brand-foreground">
                    {/* Kept for screen readers and the document outline. The map is the visible hero. */}
                    <h1 className="sr-only">See where Cagayan does business</h1>
                    <figure className="flex flex-col gap-4 px-6 pt-10 pb-20 md:px-10 lg:pt-14 lg:pb-24">
                        <div className="h-64 md:h-96 lg:h-[28rem]">
                            <LazyProvinceMap
                                shapes="province"
                                label={`Map of the ${overview.townCount} towns of Cagayan, ${overview.connectedTownCount} connected so far`}
                                highlight={overview.connectedTownCodes}
                                className="size-full"
                            />
                        </div>
                        <figcaption className="flex flex-wrap justify-center gap-x-6 gap-y-2 type-body text-brand-foreground/80">
                            <span className="flex items-center gap-2">
                                <span className="size-3 rounded-xs bg-highlight" />
                                Connected
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="size-3 rounded-xs border border-current" />
                                Not yet connected
                            </span>
                        </figcaption>
                    </figure>
                </section>

                <FigureRow
                    className="relative mx-4 -mt-12 motion-safe:animate-rise motion-safe:[animation-delay:320ms] md:mx-10 lg:grid-cols-4"
                    figures={[
                        {
                            value: `${formatCount(overview.connectedTownCount)} of ${formatCount(overview.townCount)}`,
                            label: 'Towns connected',
                        },
                        {
                            value: formatCount(overview.businessTypeCount),
                            label: 'Business types',
                        },
                        {
                            value: formatCount(overview.yearCount),
                            label: 'Years of records',
                        },
                        {
                            value: formatCount(overview.wishCount),
                            label: 'Suggestions so far',
                        },
                    ]}
                />
            </div>

            <section
                id="about-data"
                aria-labelledby="about-data-heading"
                className="grid reveal scroll-mt-24 gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-16"
            >
                <div className="flex flex-col gap-6">
                    <h2 id="about-data-heading" className="type-heading">
                        About the data
                    </h2>
                    <div className="h-72 text-primary lg:h-80">
                        <LazyProvinceMap
                            shapes="tuguegarao"
                            label="Map of the barangays of Tuguegarao City"
                            className="size-full"
                        />
                    </div>
                </div>
                <DefinitionList
                    items={[
                        {
                            term: 'Records',
                            description:
                                'Simulated. Boundaries and population are real.',
                        },
                        {
                            term: 'Area',
                            description:
                                'Tuguegarao City. Other towns join as their records are shared.',
                        },
                        {
                            term: 'Period',
                            description: `${overview.firstYear} to ${overview.latestYear}`,
                        },
                        {
                            term: 'Businesses',
                            description: 'Registered businesses only',
                        },
                        {
                            term: 'Sales',
                            description:
                                'Declared business activity, not the income of residents or of the barangay government. Public pages show a range.',
                        },
                        {
                            term: 'Boundaries',
                            description:
                                'Simplified shapes matched to PSA codes. Good for comparing areas, not for surveying.',
                        },
                    ]}
                />
            </section>

            <section
                aria-labelledby="protection"
                className="grid reveal gap-8 rounded-2xl bg-muted p-6 md:p-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-16"
            >
                <h2 id="protection" className="type-heading">
                    How businesses are protected
                </h2>
                <ol className="flex flex-col gap-6">
                    {[
                        'No single business has its sales shown to anyone, Capitol staff included.',
                        `When fewer than ${formatCount(overview.smallGroupMin)} businesses share an area or type, the figure reads "Hidden to protect individual businesses".`,
                        'Owner names and contact numbers never appear on public pages. Suggestions store no name, contact, or IP address.',
                    ].map((point, index) => (
                        <li key={point} className="flex gap-5">
                            <span
                                aria-hidden="true"
                                className="font-serif text-2xl leading-none text-muted-foreground tabular-nums"
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
                className="flex reveal flex-col gap-6"
            >
                <h2 id="tasks" className="type-heading">
                    What you can do
                </h2>
                <div className="grid gap-4 lg:grid-cols-3">
                    <Card className="justify-between lg:col-span-2 lg:row-span-2">
                        <CardHeader>
                            <Badge>Open now</Badge>
                            <CardTitle className="type-title">
                                Suggestions
                            </CardTitle>
                            <CardDescription>
                                Tell the Capitol which businesses your town is
                                missing. No account needed.
                            </CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button variant="outline" asChild>
                                <Link href={suggestions()}>
                                    Open suggestions
                                    <ArrowRight aria-hidden="true" />
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    {upcoming.map((item) => (
                        <Card key={item.title} className="bg-muted shadow-none">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <item.icon
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                    {item.title}
                                </CardTitle>
                                <CardDescription>
                                    {item.description}
                                </CardDescription>
                                <Badge variant="outline">Not open yet</Badge>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </section>
        </>
    );
}
