import { Link, usePage } from '@inertiajs/react';
import { HandHeart, House, Landmark } from 'lucide-react';
import type { ReactNode } from 'react';
import { AppBottomBar } from '@/components/app-bottom-bar';
import { AppRail } from '@/components/app-rail';
import { AppearanceToggle } from '@/components/appearance-toggle';
import { SimulatedLabel } from '@/components/privacy/simulated-label';
import { home } from '@/routes';
import { index as wishes } from '@/routes/public/wishes';
import type { NavItem } from '@/types/ui';

// Explore map (P1) and the guide (P4) join this list when they are built.
const items: NavItem[] = [
    { title: 'Home', href: home(), icon: House },
    { title: 'Wishes', href: wishes(), icon: HandHeart },
];

// Phone first. No public page links to the Capitol side, not even to its login (decisions.md, D20).
export default function PublicLayout({ children }: { children: ReactNode }) {
    const { name } = usePage().props;

    return (
        <div className="min-h-screen bg-background">
            <AppRail
                items={items}
                logo={
                    <Link
                        href={home()}
                        aria-label={name}
                        className="flex size-10 items-center justify-center outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                        <Landmark className="size-5" aria-hidden="true" />
                    </Link>
                }
                footer={<AppearanceToggle />}
            />
            <div className="flex min-h-screen flex-col pb-14 lg:pb-0 lg:pl-rail">
                <header className="border-b bg-card">
                    <div className="flex h-16 items-center gap-3 px-4 md:px-6">
                        <Link
                            href={home()}
                            className="flex min-h-10 min-w-0 items-center gap-2 type-item"
                        >
                            <Landmark
                                className="size-5 shrink-0 lg:hidden"
                                aria-hidden="true"
                            />
                            <span className="truncate">{name}</span>
                        </Link>
                        <div className="ml-auto flex items-center gap-2">
                            <SimulatedLabel />
                            <div className="lg:hidden">
                                <AppearanceToggle />
                            </div>
                        </div>
                    </div>
                </header>
                <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-4 py-8 md:px-6 lg:py-12">
                    {children}
                </main>
            </div>
            <AppBottomBar items={items} />
        </div>
    );
}
