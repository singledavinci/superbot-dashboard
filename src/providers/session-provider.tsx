import { useQuery } from '@tanstack/react-query';
import { createContext, useContext, useLayoutEffect, type ReactNode } from 'react';

import type { AuthMeResponse } from '../types';
import { authMe, extractTokenFromUrl, forceDiscordLogin, persistEligibleGuildIds, readToken } from '../lib/api';

type SessionCtx = {
    token: string | null;
    me?: AuthMeResponse;
    /** True once `/auth/me` settles — includes failures after redirects/non‑fatal retries stop. */
    resolved: boolean;
    isPending: boolean;
    /** Populated when `/auth/me` finishes with an error (network or HTTP before OAuth redirect). */
    sessionError: unknown | null;
};

const Ctx = createContext<SessionCtx | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
    useLayoutEffect(() => {
        extractTokenFromUrl();
    }, []);

    const token = readToken();
    const q = useQuery({
        queryKey: ['session', 'me'],
        queryFn: authMe,
        enabled: !!token,
        staleTime: Infinity,
    });

    useLayoutEffect(() => {
        if (!token) return;
        if (!q.data) return;
        if (q.data.requiresReauth) {
            forceDiscordLogin();
        }
        if (Array.isArray(q.data.eligibleGuildIds)) {
            persistEligibleGuildIds(q.data.eligibleGuildIds);
        }
    }, [token, q.data]);

    const resolved = !token ? true : q.isFetched;

    const ctx: SessionCtx = {
        token,
        me: q.data,
        resolved,
        isPending: !!token && q.isPending,
        sessionError: !!token && q.isFetched && q.isError ? q.error : null,
    };

    return <Ctx.Provider value={ctx}>{children}</Ctx.Provider>;
}

export function useSession(): SessionCtx {
    const v = useContext(Ctx);
    if (!v) throw new Error('useSession must be used inside SessionProvider');
    return v;
}
