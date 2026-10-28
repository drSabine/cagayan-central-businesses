import { dashboard } from '@/routes/capitol';
import { index as finances } from '@/routes/capitol/finances';
import { index as wishes } from '@/routes/capitol/wishes';
import { index as logs } from '@/routes/capitol/logs';
import { show as profile } from '@/routes/capitol/profile';
import { icons } from '@/lib/icons';
import { isCurrentSection } from '@/lib/navigation';
import type { Workspace } from '@/types/workspace';

export function workspaceDestination(url: string, workspace: Workspace) {
    return workspaceNavigation(workspace)
        .filter((item) => isCurrentSection(url, item.href))
        .sort((a, b) => b.href.url.length - a.href.url.length)[0];
}

export function workspaceNavigation(workspace: Workspace) {
    return [
        {
            label: 'Dashboard',
            group: 'Workspace',
            href: dashboard(),
            icon: icons.dashboard,
            visible: true,
        },
        {
            label: 'Government Finances',
            group: 'Workspace',
            href: finances(),
            icon: icons.finances,
            visible: true,
        },
        {
            label: 'Community Wishes',
            group: 'Management',
            href: wishes(),
            icon: icons.wishes,
            visible: workspace.canViewWishes,
        },
        {
            label: 'Activity Logs',
            group: 'Management',
            href: logs(),
            icon: icons.logs,
            visible: workspace.canViewLogs,
        },
        {
            label: 'Profile',
            group: 'Account',
            href: profile(),
            icon: icons.profile,
            visible: true,
        },
    ].filter((item) => item.visible);
}
