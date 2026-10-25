import { Link, usePage } from '@inertiajs/react';
import { ChartNoAxesCombined, House, MessageSquarePlus } from 'lucide-react';
import type { ReactNode } from 'react';
import { AppBottomBar } from '@/components/app-bottom-bar';
import { AppearanceToggle } from '@/components/appearance-toggle';
import { SimulatedLabel } from '@/components/privacy/simulated-label';
import { isCurrentSection } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { home } from '@/routes';
import { economicPerformance } from '@/routes/public';
import { index as suggestions } from '@/routes/public/wishes';
import type { NavItem } from '@/types/ui';

// The business map (P1) and the guide (P4) join this list when they are built.
const items: NavItem[] = [
    { title: 'Home', href: home(), icon: House },
    {
        title: 'Economy',
        href: economicPerformance(),
        icon: ChartNoAxesCombined,
    },
    { title: 'Suggestions', href: suggestions(), icon: MessageSquarePlus },
];

// No top bar: a slim line that scrolls away with the page, with text links from lg (design.md, "App shell").
// Phones keep the bottom bar. No public page links to the Capitol side, not even to its login (decisions.md, D20).
export default function PublicLayout({ children }: { children: ReactNode }) {
    const { props, url } = usePage();

    return (
        <div className="flex min-h-screen flex-col bg-background pb-14 lg:pb-0">
            <div className="mx-auto flex h-12 w-full max-w-6xl items-center gap-4 px-gutter md:px-6">
                <Link
                    href={home()}
                    className="truncate rounded-sm type-label outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                    {props.name}
                </Link>
                <SimulatedLabel />
                {/* Text links in the same line, not a bar. Phones use the bottom bar instead. */}
                <nav
                    aria-label="Main"
                    className="ml-auto hidden items-center gap-1 lg:flex"
                >
                    {items.map((item) => {
                        const current = isCurrentSection(url, item.href);

                        return (
                            <Link
                                key={item.title}
                                href={item.href}
                                prefetch
                                aria-current={current ? 'page' : undefined}
                                className={cn(
                                    'rounded-sm px-2 py-1 type-label text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50',
                                    current &&
                                        'text-foreground underline decoration-highlight decoration-2 underline-offset-6',
                                )}
                            >
                                {item.title}
                            </Link>
                        );
                    })}
                </nav>
                <div className="ml-auto shrink-0 lg:ml-2">
                    <AppearanceToggle />
                </div>
            </div>
            <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-section px-gutter pb-section md:px-6">
                {children}
            </main>
            <footer className="mt-auto bg-brand text-brand-foreground">
                <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-gutter py-8 md:px-6">
                    <div className="flex flex-col gap-1">
                        <p className="type-label text-brand-foreground/75">
                            Republic of the Philippines
                        </p>
                        <p className="type-heading">
                            Provincial Government of Cagayan
                        </p>
                        <p className="type-meta text-brand-foreground/75">
                            Cagayan Business is a public information and citizen
                            engagement initiative.
                        </p>
                    </div>
                    <div className="border-t border-brand-foreground/20 pt-4 type-meta text-brand-foreground/75">
                        Digital Innovation Challenge 2026
                    </div>
                </div>
            </footer>
            <AppBottomBar items={items} />
        </div>
    );
}
