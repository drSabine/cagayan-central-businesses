// Mirrors app/Data/SessionUser. Only these fields of the account reach the browser (P10).
export type SessionUser = {
    name: string;
};

export type Auth = {
    user: SessionUser | null;
};
