import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { AppearanceToggle } from '@/components/appearance-toggle';
import { WorkspaceStatus } from '@/components/capitol/workspace-status';
import { SimulatedLabel } from '@/components/privacy/simulated-label';
import { Button } from '@/components/ui/button';
import { useFlashToast } from '@/hooks/use-flash-toast';
import { icons } from '@/lib/icons';
import { pagePath, pageSearchParams } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { navigateDashboard } from '@/lib/workspace-map-navigation';
import { workspaceNavigation } from '@/lib/workspace-navigation';
import { logout } from '@/routes';
import { dashboard } from '@/routes/capitol';
import type { Workspace, WorkspaceMap } from '@/types/workspace';

export default function CapitolLayout({ children }: { children: ReactNode }) {
    const { props, url } = usePage();
    const workspace = props.workspace as Workspace;
    const [open, setOpen] = useState(false);
    const items = workspaceNavigation(workspace);
    const path = pagePath(url);
    const current = items.find((item) => item.href.url === path);
    const params = pageSearchParams(url);
    const map = props.map as WorkspaceMap | undefined;
    const town =
        path === dashboard().url
            ? map?.atlas.towns.find((item) => item.code === params.get('town'))
            : undefined;
    const barangay = town
        ? map?.barangays.find((item) => item.code === params.get('barangay'))
        : undefined;
    useFlashToast();
    useEffect(() => setOpen(false), [url]);
    const Menu = open ? icons.close : icons.menu;
    const SignOut = icons.signOut;
    const Chevron = icons.breadcrumb;

    return (
        <div className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[var(--workspace-sidebar-width)_minmax(0,1fr)]">
            <a
                href="#workspace-content"
                className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:bg-background focus:p-3"
            >
                Skip to Content
            </a>
            <aside className="border-b bg-card lg:fixed lg:inset-y-0 lg:w-(--workspace-sidebar-width) lg:border-r lg:border-b-0">
                <div className="flex h-16 items-center justify-between gap-3 border-b px-4">
                    <Link
                        href={dashboard()}
                        className="type-item focus-visible:outline-ring"
                    >
                        {props.name}
                    </Link>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        aria-label={
                            open ? 'Close navigation' : 'Open navigation'
                        }
                        aria-expanded={open}
                        aria-controls="workspace-navigation"
                        onClick={() => setOpen(!open)}
                    >
                        <Menu aria-hidden="true" />
                    </Button>
                </div>
                <div
                    id="workspace-navigation"
                    className={cn(
                        'flex-col gap-4 p-3 lg:flex lg:h-[calc(100dvh-4rem)]',
                        open ? 'flex' : 'hidden',
                    )}
                >
                    <nav aria-label="Workspace" className="flex flex-col gap-1">
                        {items.map(({ label, href, icon: Icon }) => (
                            <Link
                                key={label}
                                href={href}
                                aria-current={
                                    path === href.url ? 'page' : undefined
                                }
                                className={cn(
                                    'flex min-h-10 items-center gap-3 rounded-sm px-3 py-2 type-body hover:bg-muted focus-visible:outline-ring',
                                    path === href.url && 'bg-muted font-medium',
                                )}
                            >
                                <Icon
                                    className="size-4 shrink-0"
                                    aria-hidden="true"
                                />
                                {label}
                            </Link>
                        ))}
                    </nav>
                    <div className="mt-auto flex flex-col gap-3 border-t pt-3">
                        <div className="px-3">
                            <p className="truncate type-body">
                                {workspace.displayName}
                            </p>
                            <p className="type-meta">{workspace.role}</p>
                        </div>
                        <div className="flex items-center justify-between">
                            <Button variant="ghost" asChild>
                                <Link href={logout()} as="button">
                                    <SignOut
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                    Sign Out
                                </Link>
                            </Button>
                            <AppearanceToggle />
                        </div>
                    </div>
                </div>
            </aside>
            <div className="min-w-0 lg:col-start-2">
                <div className="flex min-h-12 items-center justify-between gap-3 border-b px-gutter md:px-6">
                    <nav aria-label="Breadcrumb">
                        <ol className="flex flex-wrap items-center gap-2 type-body">
                            <li>
                                {current?.label === 'Dashboard' && !town ? (
                                    <span aria-current="page">Dashboard</span>
                                ) : (
                                    <Link
                                        className="underline underline-offset-4"
                                        href={dashboard()}
                                        onClick={(event) => {
                                            if (
                                                path === dashboard().url &&
                                                !event.metaKey &&
                                                !event.ctrlKey &&
                                                !event.shiftKey &&
                                                !event.altKey
                                            ) {
                                                event.preventDefault();
                                                void navigateDashboard(null);
                                            }
                                        }}
                                    >
                                        Dashboard
                                    </Link>
                                )}
                            </li>
                            {town && (
                                <li className="flex items-center gap-2">
                                    <Chevron
                                        className="size-3"
                                        aria-hidden="true"
                                    />
                                    <Link
                                        className="underline underline-offset-4"
                                        href={dashboard({
                                            query: { town: town.code },
                                        })}
                                        onClick={(event) => {
                                            if (
                                                !event.metaKey &&
                                                !event.ctrlKey &&
                                                !event.shiftKey &&
                                                !event.altKey
                                            ) {
                                                event.preventDefault();
                                                void navigateDashboard(
                                                    town.code,
                                                );
                                            }
                                        }}
                                    >
                                        {town.name}
                                    </Link>
                                </li>
                            )}
                            {barangay && (
                                <li className="flex items-center gap-2">
                                    <Chevron
                                        className="size-3"
                                        aria-hidden="true"
                                    />
                                    <span aria-current="page">
                                        {barangay.name}
                                    </span>
                                </li>
                            )}
                            {current && current.label !== 'Dashboard' && (
                                <li className="flex items-center gap-2">
                                    <Chevron
                                        className="size-3"
                                        aria-hidden="true"
                                    />
                                    <span aria-current="page">
                                        {current.label}
                                    </span>
                                </li>
                            )}
                        </ol>
                    </nav>
                    <SimulatedLabel />
                </div>
                <main
                    id="workspace-content"
                    className="flex min-w-0 flex-col gap-4 p-gutter md:p-6"
                >
                    <WorkspaceStatus workspace={workspace} />
                    {children}
                </main>
            </div>
        </div>
    );
}
