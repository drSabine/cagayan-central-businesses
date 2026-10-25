import { Head } from '@inertiajs/react';
import { WorkspaceTable } from '@/components/capitol/workspace-table';
import type { WorkspaceTable as Data } from '@/types/workspace';

export default function ActivityLogs({ table }: { table: Data }) {
    return (
        <>
            <Head title="Activity Logs" />
            <header>
                <h1 className="type-heading">Activity Logs</h1>
            </header>
            <WorkspaceTable data={table} kind="logs" />
        </>
    );
}
