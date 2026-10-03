import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import AppLogo from '@/components/app-logo';
import { SimulatedLabel } from '@/components/privacy/simulated-label';
import { Button } from '@/components/ui/button';
import { home, login } from '@/routes';

// Phone first. The login link is the only way from a public page to the Capitol side.
export default function PublicLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <header className="border-b">
                <div className="mx-auto flex h-16 w-full max-w-5xl items-center gap-3 px-4">
                    <Link
                        href={home()}
                        className="flex min-h-10 min-w-0 items-center"
                    >
                        <AppLogo />
                    </Link>
                    <div className="ml-auto flex items-center gap-2">
                        <SimulatedLabel />
                        <Button variant="ghost" className="min-h-10" asChild>
                            <Link href={login()}>Log in</Link>
                        </Button>
                    </div>
                </div>
            </header>
            <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6">
                {children}
            </main>
        </div>
    );
}
