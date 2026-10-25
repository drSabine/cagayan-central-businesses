import type { SelectOption, TownAtlas, BarangayProfile } from '@/types/data';

export type Workspace = {
    displayName: string;
    role: string;
    canViewWishes: boolean;
    canViewLogs: boolean;
    isBirthday: boolean;
    idleExpiresAt: number;
    absoluteExpiresAt: number;
    warningSeconds: number;
    serverNow: number;
    activityIntervalSeconds: number;
};
export type WorkspaceMap = { atlas: TownAtlas; barangays: BarangayProfile[] };
export type WorkspaceTable = {
    rows: Record<string, string | number | null>[];
    previous: string | null;
    next: string | null;
    page: number;
    towns: SelectOption[];
    categories: SelectOption[];
    filters: Record<string, string | null>;
};
export type AccountProfile = {
    displayName: string;
    email: string;
    role: string;
    birthdayMonth: number | null;
    birthdayDay: number | null;
    displayNameMax: number;
};
