import { Head, Link } from '@inertiajs/react';
import { login } from '@/routes';

// Placeholder until the design system and P1 (Explore map) are built.
export default function Welcome() {
    return (
        <>
            <Head title="Home" />
            <main className="mx-auto flex max-w-xl flex-col gap-4 p-6">
                <h1 className="text-2xl font-semibold">Cagayan Business</h1>
                <Link href={login()} className="underline">
                    Log in
                </Link>
            </main>
        </>
    );
}
