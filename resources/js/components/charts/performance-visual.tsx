import { Component, Suspense, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

class ChartBoundary extends Component<
    { children: ReactNode },
    { failed: boolean }
> {
    state = { failed: false };

    static getDerivedStateFromError() {
        return { failed: true };
    }

    render() {
        return this.state.failed ? (
            <div
                role="alert"
                className="flex min-h-64 flex-col items-center justify-center gap-4 p-6"
            >
                <p className="type-body">
                    Unable to display the visualization.
                </p>
                <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                >
                    Retry
                </Button>
            </div>
        ) : (
            this.props.children
        );
    }
}

export default function PerformanceVisual({
    children,
}: {
    children: ReactNode;
}) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    const loading = (
        <Skeleton
            className="h-72 w-full motion-reduce:animate-none"
            aria-label="Loading visualization"
        />
    );

    return mounted ? (
        <ChartBoundary>
            <Suspense fallback={loading}>{children}</Suspense>
        </ChartBoundary>
    ) : (
        loading
    );
}
