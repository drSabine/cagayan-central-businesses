import type { SelectOption, TownAtlas, BarangayProfile } from '@/types/data';
import type { FinanceMap } from '@/types/finance-map';

export type Workspace = {
    displayName: string;
    role: string;
    canViewWishes: boolean;
    canViewLogs: boolean;
    canManageCategories: boolean;
    isBirthday: boolean;
    idleExpiresAt: number;
    absoluteExpiresAt: number;
    warningSeconds: number;
    serverNow: number;
    activityIntervalSeconds: number;
};
export type WorkspaceMap = {
    atlas: TownAtlas;
    barangays: BarangayProfile[];
    finances: FinanceMap;
};
export type WorkspaceTable = {
    rows: Record<string, string | number | null>[];
    pagination: Pagination;
    towns: SelectOption[];
    categories: SelectOption[];
    filters: Record<string, string | null>;
};
export type Pagination = {
    previous: string | null;
    next: string | null;
    page: number;
    lastPage: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { page: number; url: string }[];
};
export type AccountProfile = {
    displayName: string;
    email: string;
    role: string;
    birthdayMonth: number | null;
    birthdayDay: number | null;
    displayNameMax: number;
};

export type BusinessTypeRow = {
    code: string;
    name: string;
    category: string;
    industry: string;
    industryCode: string;
    registered: number | null;
};

export type BusinessCategoryRow = {
    code: string;
    name: string;
    color: number;
    types: number;
    registered: number | null;
};

export type BusinessCategories = {
    types: BusinessTypeRow[];
    categories: BusinessCategoryRow[];
    industries: SelectOption[];
    year: number | null;
    typeNameMax: number;
    categoryNameMax: number;
    colors: number;
    pageSize: number;
};

export type BusinessDirectoryRow = {
    name: string;
    type: string;
    category: string;
    industry: string;
    barangay: string;
    yearEstablished: number;
    status: string | null;
};

export type BusinessDirectory = {
    rows: BusinessDirectoryRow[];
    pagination: Pagination;
    categories: { code: string; name: string; color: number }[];
    types: SelectOption[];
    industries: SelectOption[];
    statuses: SelectOption[];
    filters: {
        q: string | null;
        category: string | null;
        type: string | null;
        industry: string | null;
        status: string | null;
        sort: string;
        dir: string;
    };
    enabled: boolean;
};
