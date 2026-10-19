import { lazy, Suspense, useSyncExternalStore } from 'react';
import type { ProvinceMapProps } from '@/components/province-map';
import { Skeleton } from '@/components/ui/skeleton';

const ProvinceMap = lazy(() => import('@/components/province-map'));

const subscribe = () => () => {};

// Rendered in the browser only. A lazy component suspending during server rendering
// makes React throw the HTML away and log "Switched to client rendering".
export function LazyProvinceMap(props: ProvinceMapProps) {
    const inBrowser = useSyncExternalStore(
        subscribe,
        () => true,
        () => false,
    );
    const skeleton = (
        <Skeleton
            role="presentation"
            className="size-full rounded-2xl bg-current/10"
        />
    );

    if (!inBrowser) {
        return skeleton;
    }

    return (
        <Suspense fallback={skeleton}>
            <ProvinceMap {...props} />
        </Suspense>
    );
}
