import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';

import type { AuthMeResponse } from '../types';
import { persistActiveGuildId, readActiveGuildId } from '../lib/api';

type GuildCtx = {
    guildId: string | null;
    /** Human label from guildSummaries when available */
    guildLabel: (id: string) => string;
    setGuildId: (id: string) => void;
};

const Ctx = createContext<GuildCtx | null>(null);

export function ActiveGuildProvider({ me, children }: { me: AuthMeResponse; children: ReactNode }) {
    const eligible = useMemo(
        () => (Array.isArray(me.eligibleGuildIds) ? [...me.eligibleGuildIds].filter(Boolean) : []),
        [me.eligibleGuildIds],
    );

    const summaryMap = useMemo(() => {
        const m = new Map<string, string>();
        const list = me.eligibleGuildSummaries;
        if (!Array.isArray(list)) return m;
        for (const row of list) {
            if (row?.id) m.set(row.id, row.name || row.id);
        }
        return m;
    }, [me.eligibleGuildSummaries]);

    const guildLabel = (id: string) => summaryMap.get(id) ?? id;

    const [guildId, setGuildState] = useState<string | null>(() => {
        const stored = readActiveGuildId();
        if (stored && eligible.includes(stored)) return stored;
        const pref =
            typeof me.guildId === 'string' && me.guildId.trim() && eligible.includes(me.guildId.trim())
                ? me.guildId.trim()
                : null;
        return pref ?? (eligible.length ? eligible[0]! : null);
    });

    useEffect(() => {
        if (!eligible.length) {
            setGuildState(null);
            return;
        }
        if (guildId && eligible.includes(guildId)) return;
        const stored = readActiveGuildId();
        const next =
            stored && eligible.includes(stored)
                ? stored
                : typeof me.guildId === 'string' &&
                    me.guildId.trim() &&
                    eligible.includes(me.guildId.trim())
                  ? me.guildId.trim()
                  : eligible[0]!;
        setGuildState(next);
        persistActiveGuildId(next);
    }, [eligible, guildId, me.guildId]);

    const setGuildId = (next: string) => {
        if (!eligible.includes(next)) return;
        persistActiveGuildId(next);
        setGuildState(next);
    };

    const value: GuildCtx = { guildId, guildLabel, setGuildId };
    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useActiveGuild(): GuildCtx {
    const v = useContext(Ctx);
    if (!v) throw new Error('useActiveGuild must be inside ActiveGuildProvider');
    return v;
}
