import { Link, usePage } from '@inertiajs/react';
import { House, MessageSquarePlus } from 'lucide-react';
import type { ReactNode } from 'react';
import { AppBottomBar } from '@/components/app-bottom-bar';
import { AppearanceToggle } from '@/components/appearance-toggle';
import { SimulatedLabel } from '@/components/privacy/simulated-label';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { isCurrentSection } from '@/lib/navigation';
import { home } from '@/routes';
import { index as suggestions } from '@/routes/public/wishes';
import type { NavItem } from '@/types/ui';

// The business map (P1) and the guide (P4) join this list when they are built.
const items: NavItem[] = [
    { title: 'Home', href: home(), icon: House },
    { title: 'Suggestions', href: suggestions(), icon: MessageSquarePlus },
];

// Phone first. No public page links to the Capitol side, not even to its login (decisions.md, D20).
export default function PublicLayout({ children }: { children: ReactNode }) {
    const { url, props } = usePage();

    return (
        <div className="flex min-h-screen flex-col bg-background pb-14 lg:pb-0">
            <header className="sticky top-0 z-30 border-b bg-background">
                <div className="mx-auto flex h-16 max-w-6xl items-center gap-10 px-4 md:px-6">
                    <Link
                        href={home()}
                        className="flex min-w-0 items-center rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                        <span className="flex min-w-0 flex-col">
                            <span className="truncate type-item leading-tight">
                                {props.name}
                            </span>
                            <SimulatedLabel />
                        </span>
                    </Link>
                    <NavigationMenu
                        viewport={false}
                        aria-label="Main"
                        className="hidden lg:flex"
                    >
                        <NavigationMenuList>
                            {items.map((item) => (
                                <NavigationMenuItem key={item.title}>
                                    <NavigationMenuLink
                                        asChild
                                        active={isCurrentSection(
                                            url,
                                            item.href,
                                        )}
                                        className={navigationMenuTriggerStyle()}
                                    >
                                        <Link href={item.href} prefetch>
                                            {item.title}
                                        </Link>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            ))}
                        </NavigationMenuList>
                    </NavigationMenu>
                    <div className="ml-auto shrink-0">
                        <AppearanceToggle />
                    </div>
                </div>
            </header>
            <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-16 px-4 py-8 md:px-6 lg:gap-24 lg:py-12">
                {children}
            </main>
            <footer className="border-t">
                <div className="mx-auto max-w-6xl px-4 py-8 type-meta md:px-6">
                    <p>
                        Prepared for the Provincial Government of Cagayan
                        Digital Innovation Challenge.
                    </p>
                </div>
            </footer>
            <AppBottomBar items={items} />
        </div>
    );
}
