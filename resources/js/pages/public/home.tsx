import { Head, Link } from '@inertiajs/react';
import {
    CalendarRange,
    ClipboardList,
    EyeOff,
    HandHeart,
    Layers,
    Map as MapIcon,
    MapPinned,
    PlugZap,
    UserX,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { FigureCell, RuledCell, RuledGrid } from '@/components/ruled-grid';
import { SectionHeading } from '@/components/section-heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCount } from '@/lib/format';
import { index as wishes } from '@/routes/public/wishes';
import type { HomeOverview } from '@/types/data';
import type { RouteDefinition } from '@/wayfinder';

type Props = {
    overview: HomeOverview;
};

type Feature = {
    icon: LucideIcon;
    title: string;
    description: string;
    href?: RouteDefinition<'get'>;
    action?: string;
};

// Explore map (P1) and the guide (P4) get their links when they are built.
const features: Feature[] = [
    {
        icon: MapIcon,
        title: 'Explore the map',
        description:
            'See how many registered businesses each barangay has and which types are most common.',
    },
    {
        icon: ClipboardList,
        title: 'Start a business guide',
        description:
            'Answer four questions and get a checklist of what to prepare and where to get it.',
    },
    {
        icon: HandHeart,
        title: 'Wish for a business',
        description:
            'Tell the Capitol what kind of business your town is missing. No name or account needed.',
        href: wishes(),
        action: 'Make a wish',
    },
];

const protections: { icon: LucideIcon; title: string; description: string }[] =
    [
        {
            icon: Layers,
            title: 'Sales are shown for areas only',
            description:
                'No single business has its sales shown to anyone. The public sees a range for each area.',
        },
        {
            icon: EyeOff,
            title: 'Small groups are hidden',
            description:
                'When too few businesses share an area or type, the figure reads "Hidden to protect individual businesses".',
        },
        {
            icon: UserX,
            title: 'Wishes are anonymous',
            description:
                'Wishes keep no name, contact, or network address. Only the Capitol reads the reasons.',
        },
    ];

export default function Home({ overview }: Props) {
    return (
        <>
            <Head title="Home" />

            <PageHeader
                label="Cagayan Business"
                title="Businesses in Tuguegarao City"
                subtitle={
                    <>
                        One map of registered businesses for the planners who
                        decide and the people who want to start. Registered
                        businesses only.
                    </>
                }
                actions={
                    <Button asChild>
                        <Link href={wishes()}>
                            <HandHeart aria-hidden="true" />
                            Make a wish
                        </Link>
                    </Button>
                }
            />

            <section aria-labelledby="features" className="flex flex-col gap-4">
                <SectionHeading
                    id="features"
                    label="What you can do here"
                    description="No login needed for any of these."
                />
                <RuledGrid columns={3}>
                    {features.map((feature) => (
                        <RuledCell
                            key={feature.title}
                            className="justify-between gap-8 md:min-h-56"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <feature.icon
                                    className="size-5"
                                    aria-hidden="true"
                                />
                                {!feature.href && (
                                    <Badge variant="outline">
                                        In preparation
                                    </Badge>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <h3 className="type-panel-title">
                                    {feature.title}
                                </h3>
                                <p className="type-meta">
                                    {feature.description}
                                </p>
                                {feature.href && feature.action && (
                                    <Button
                                        variant="outline"
                                        className="mt-2 w-fit"
                                        asChild
                                    >
                                        <Link href={feature.href}>
                                            {feature.action}
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </RuledCell>
                    ))}
                </RuledGrid>
            </section>

            <section aria-labelledby="data" className="flex flex-col gap-4">
                <SectionHeading
                    id="data"
                    label="About the data"
                    description="Boundaries and population are real. Business records are simulated for this prototype."
                />
                <RuledGrid columns={3}>
                    <FigureCell
                        icon={MapPinned}
                        figure={formatCount(overview.townCount)}
                        label="Towns in Cagayan"
                        caption="All appear on the province map"
                    />
                    <FigureCell
                        icon={PlugZap}
                        figure={formatCount(overview.connectedTownCount)}
                        label="Towns connected"
                        caption="More towns join as their records are shared"
                    />
                    <FigureCell
                        icon={CalendarRange}
                        figure={formatCount(overview.yearCount)}
                        label="Years of records"
                        caption={`${overview.firstYear} to ${overview.latestYear}`}
                    />
                </RuledGrid>
            </section>

            <section aria-labelledby="privacy" className="flex flex-col gap-4">
                <SectionHeading
                    id="privacy"
                    label="How we protect businesses"
                />
                <RuledGrid columns={3}>
                    {protections.map((item) => (
                        <RuledCell key={item.title}>
                            <item.icon className="size-5" aria-hidden="true" />
                            <h3 className="type-item">{item.title}</h3>
                            <p className="type-meta">{item.description}</p>
                        </RuledCell>
                    ))}
                </RuledGrid>
            </section>

            <footer className="flex flex-col gap-1 border-t pt-6 type-meta">
                <p>
                    Barangay names, codes, and population from the Philippine
                    Statistics Authority. Boundary shapes from
                    philippines-json-maps by James Faeldon, MIT License.
                </p>
                <p>
                    Built for the Provincial Government of Cagayan Digital
                    Innovation Challenge.
                </p>
            </footer>
        </>
    );
}
