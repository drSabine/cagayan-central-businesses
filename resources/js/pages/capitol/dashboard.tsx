import { Head, Link, usePage } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { logout } from '@/routes';

// Placeholder until the Capitol layout and C1 (Province at a glance) are built.
export default function Dashboard() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Capitol" />
            <main className="mx-auto flex max-w-measure flex-col gap-6 px-4 py-12">
                <PageHeader
                    title="Capitol dashboard"
                    subtitle={`Signed in as ${auth.user?.name ?? 'administrator'}.`}
                />
                <Button variant="outline" className="w-fit" asChild>
                    <Link href={logout()} as="button">
                        Sign out
                    </Link>
                </Button>
            </main>
        </>
    );
}
