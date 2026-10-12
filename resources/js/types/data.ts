// Mirrors of the PHP Data objects in app/Data, field for field.

export type SelectOption = {
    value: string;
    label: string;
};

export type HomeOverview = {
    townCount: number;
    connectedTownCount: number;
    firstYear: number;
    latestYear: number;
    yearCount: number;
};

export type WishTally = {
    townName: string;
    typeName: string;
    wishCount: number;
    // Null means "Not available", never zero.
    registeredCount: number | null;
};

export type MyWish = {
    id: number;
    townCode: string;
    townName: string;
    typeCode: string;
    typeName: string;
    reason: string | null;
    editsLeft: number;
    nextEditAt: string | null;
};

export type WishPage = {
    towns: SelectOption[];
    types: SelectOption[];
    defaultTown: string | null;
    tally: WishTally | null;
    myWish: MyWish | null;
    nextWishAt: string | null;
    cooldownDays: number;
    editsPerWindow: number;
    editWindowDays: number;
    reasonMax: number;
    formToken: string;
};
