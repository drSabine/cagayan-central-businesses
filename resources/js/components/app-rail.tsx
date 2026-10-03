import { Link, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { isCurrentSection } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/types/ui';

type Props = {
    items: NavItem[];
    logo: ReactNode;
    footer?: ReactNode;
};

// Laptop navigation (design.md, "App shell"). Phones use AppBottomBar instead.
export function AppRail({ items, logo, footer }: Props) {
    const { url } = usePage();

    return (
        <nav
            aria-label="Main"
            className="fixed inset-y-0 left-0 z-20 hidden w-rail flex-col items-center border-r bg-card lg:flex"
        >
            <div className="flex h-16 w-full items-center justify-center border-b">
                {logo}
            </div>
            <ul className="flex w-full flex-1 flex-col">
                {items.map((item) => {
                    const current = isCurrentSection(url, item.href);

                    return (
                        <li key={item.title} className="relative">
                            {current && (
                                <span
                                    aria-hidden="true"
                                    className="absolute inset-y-0 left-0 w-0.5 bg-highlight"
                                />
                            )}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link
                                        href={item.href}
                                        prefetch
                                        aria-label={item.title}
                                        aria-current={
                                            current ? 'page' : undefined
                                        }
                                        className={cn(
                                            'flex h-14 w-full items-center justify-center text-foreground transition-colors outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset',
                                            current && 'bg-accent',
                                        )}
                                    >
                                        <item.icon
                                            className="size-5"
                                            aria-hidden="true"
                                        />
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                    {item.title}
                                </TooltipContent>
                            </Tooltip>
                        </li>
                    );
                })}
            </ul>
            {footer && (
                <div className="flex w-full justify-center border-t py-3">
                    {footer}
                </div>
            )}
        </nav>
    );
}
