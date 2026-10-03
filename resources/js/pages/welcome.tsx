import { Head } from '@inertiajs/react';

// Placeholder until P1 (Explore map) becomes the public home page.
export default function Welcome() {
    return (
        <>
            <Head title="Home" />
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-semibold">
                    Businesses in Tuguegarao City
                </h1>
                <p className="text-muted-foreground">
                    Registered businesses only
                </p>
            </div>
        </>
    );
}
