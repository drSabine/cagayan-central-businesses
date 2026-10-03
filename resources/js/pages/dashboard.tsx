import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { logout } from '@/routes';

// Placeholder until the design system and C1 (Province at a glance) are built.
export default function Dashboard() {
    return (
        <>
            <Head title="Dashboard" />
            <main className="mx-auto flex max-w-xl flex-col gap-4 p-6">
                <h1 className="text-2xl font-semibold">Dashboard</h1>
                <Button variant="outline" className="w-fit" asChild>
                    <Link href={logout()} as="button">
                        Log out
                    </Link>
                </Button>
            </main>
        </>
    );
}
