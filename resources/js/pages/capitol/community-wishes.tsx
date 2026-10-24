import { Head } from '@inertiajs/react';
import { WorkspaceTable } from '@/components/capitol/workspace-table';
import type { WorkspaceTable as Data } from '@/types/workspace';

export default function CommunityWishes({ table }: { table: Data }) {
    return (
        <>
            <Head title="Community Wishes" />
            <header>
                <h1 className="type-heading">Community Wishes</h1>
            </header>
            <WorkspaceTable data={table} kind="wishes" />
        </>
    );
}
