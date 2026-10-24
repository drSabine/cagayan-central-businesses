import { dashboard } from '@/routes/capitol';
import { index as wishes } from '@/routes/capitol/wishes';
import { index as logs } from '@/routes/capitol/logs';
import { show as profile } from '@/routes/capitol/profile';
import { icons } from '@/lib/icons';
import type { Workspace } from '@/types/workspace';

export function workspaceNavigation(workspace: Workspace) {
    return [
        {
            label: 'Dashboard',
            href: dashboard(),
            icon: icons.dashboard,
            visible: true,
        },
        {
            label: 'Community Wishes',
            href: wishes(),
            icon: icons.wishes,
            visible: workspace.canViewWishes,
        },
        {
            label: 'Activity Logs',
            href: logs(),
            icon: icons.logs,
            visible: workspace.canViewLogs,
        },
        {
            label: 'Profile',
            href: profile(),
            icon: icons.profile,
            visible: true,
        },
    ].filter((item) => item.visible);
}
