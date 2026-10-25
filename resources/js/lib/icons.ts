import {
    LayoutDashboard,
    MessageSquare,
    ScrollText,
    UserRound,
    Menu,
    X,
    LogOut,
    MapPin,
    ChevronRight,
    RotateCcw,
    ListChecks,
} from 'lucide-react';

export const icons = {
    dashboard: LayoutDashboard,
    wishes: MessageSquare,
    logs: ScrollText,
    profile: UserRound,
    menu: Menu,
    close: X,
    signOut: LogOut,
    location: MapPin,
    breadcrumb: ChevronRight,
    reset: RotateCcw,
    work: ListChecks,
} as const;
