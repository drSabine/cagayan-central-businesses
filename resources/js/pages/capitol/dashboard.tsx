import { Head } from '@inertiajs/react';
import { DashboardAtlas } from '@/components/map/dashboard-atlas';
import type { WorkspaceMap } from '@/types/workspace';

export default function Dashboard({ map }: { map: WorkspaceMap }) {
    return (
        <>
            <Head title="Dashboard" />
            <DashboardAtlas data={map} />
        </>
    );
}
