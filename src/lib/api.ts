import type {
    AlertChannelRow,
    AuthMeResponse,
    GuildStatsResponse,
    GuildStatusResponse,
    RecentAlertRow,
    TrackedCollection,
    WatchlistRow,
    WatchedWallet,
} from '../types';

export const API_BASE = import.meta.env.VITE_API_URL || 'https://superbot-backend-production.up.railway.app';

export const BUILD_SHA = import.meta.env.VITE_GIT_SHA || 'unknown';

const TOKEN_KEY = 'superbot_token';
export const ACTIVE_GUILD_KEY = 'superbot_active_guild';
export const ELIGIBLE_GUILDS_STORAGE_KEY = 'superbot_eligible_guild_ids';

export type ApiHttpError = Error & { status: number };

function oauthStartUrl(): string {
    return `${API_BASE}/api/v1/auth/discord`;
}

export function persistEligibleGuildIds(ids: string[]): void {
    try {
        localStorage.setItem(ELIGIBLE_GUILDS_STORAGE_KEY, JSON.stringify(ids));
    } catch {
        /* ignore */
    }
}

export function persistToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
}

export function readToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function persistActiveGuildId(id: string): void {
    localStorage.setItem(ACTIVE_GUILD_KEY, id);
}

export function readActiveGuildId(): string | null {
    return localStorage.getItem(ACTIVE_GUILD_KEY);
}

export function clearSessionStorage(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ACTIVE_GUILD_KEY);
    localStorage.removeItem(ELIGIBLE_GUILDS_STORAGE_KEY);
}

export function forceDiscordLogin(): void {
    clearSessionStorage();
    window.location.replace(oauthStartUrl());
}

async function extractErrorDetail(res: Response): Promise<string> {
    try {
        const cloned = res.clone();
        const ct = cloned.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
            const j = (await cloned.json()) as { error?: unknown };
            if (typeof j?.error === 'string' && j.error.trim()) return j.error.trim();
        } else {
            const t = await cloned.text();
            if (t && t.length < 500) return t.trim();
        }
    } catch {
        /* ignore */
    }
    return res.statusText || `HTTP ${res.status}`;
}

function httpError(status: number, message: string): ApiHttpError {
    const err = new Error(message) as ApiHttpError;
    err.status = status;
    return err;
}

export async function publicJson<T>(path: string): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) throw httpError(res.status, await extractErrorDetail(res));
    return res.json() as Promise<T>;
}

/**
 * Bearer-authenticated fetch. On 401/403 clears dashboard storage and starts Discord OAuth.
 */
export async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
    const token = readToken();
    if (!token) {
        forceDiscordLogin();
        throw httpError(401, 'Missing session token');
    }
    const headers = new Headers(init.headers);
    if (
        init.body !== undefined &&
        init.body !== null &&
        !(init.body instanceof FormData) &&
        !headers.has('Content-Type')
    ) {
        headers.set('Content-Type', 'application/json');
    }
    headers.set('Authorization', `Bearer ${token}`);

    const res = await fetch(`${API_BASE}${path}`, { ...init, headers });

    if (res.status === 401 || res.status === 403) {
        clearSessionStorage();
        window.location.replace(oauthStartUrl());
        throw httpError(res.status, await extractErrorDetail(res));
    }

    return res;
}

export async function authJson<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await authFetch(path, init);
    if (!res.ok) throw httpError(res.status, await extractErrorDetail(res));
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
        throw httpError(res.status, 'Server returned non-JSON response');
    }
    return res.json() as Promise<T>;
}

export async function authMe(): Promise<AuthMeResponse> {
    return authJson<AuthMeResponse>('/api/v1/auth/me');
}

export async function guildWallets(guildDiscordId: string): Promise<WatchedWallet[]> {
    const r = await authJson<{ wallets?: WatchedWallet[] }>(`/api/v1/guilds/${guildDiscordId}/wallets`);
    return r.wallets ?? [];
}

export async function postWallet(
    guildDiscordId: string,
    body: { address: string; label?: string | null; alertChannelId?: string | null },
): Promise<WatchedWallet> {
    const r = await authJson<{ wallet?: WatchedWallet }>(`/api/v1/guilds/${guildDiscordId}/wallets`, {
        method: 'POST',
        body: JSON.stringify(body),
    });
    if (!r.wallet) throw httpError(500, 'Invalid wallet response');
    return r.wallet;
}

export async function deleteWalletReq(guildDiscordId: string, walletId: string): Promise<void> {
    await authJson(`/api/v1/guilds/${guildDiscordId}/wallets/${walletId}`, { method: 'DELETE' });
}

export async function guildCollections(guildDiscordId: string): Promise<TrackedCollection[]> {
    const r = await authJson<{ collections?: TrackedCollection[] }>(
        `/api/v1/guilds/${guildDiscordId}/collections`,
    );
    return r.collections ?? [];
}

export async function postCollection(
    guildDiscordId: string,
    body: {
        contract: string;
        name: string;
        floorAlertPct?: number | null;
        alertChannelId?: string | null;
    },
): Promise<TrackedCollection> {
    const r = await authJson<{ collection?: TrackedCollection }>(
        `/api/v1/guilds/${guildDiscordId}/collections`,
        {
            method: 'POST',
            body: JSON.stringify(body),
        },
    );
    if (!r.collection) throw httpError(500, 'Invalid collection response');
    return r.collection;
}

export async function patchCollection(
    guildDiscordId: string,
    collectionId: string,
    patch: Record<string, unknown>,
): Promise<TrackedCollection> {
    const r = await authJson<{ collection?: TrackedCollection }>(
        `/api/v1/guilds/${guildDiscordId}/collections/${collectionId}`,
        {
            method: 'PATCH',
            body: JSON.stringify(patch),
        },
    );
    if (!r.collection) throw httpError(500, 'Invalid collection response');
    return r.collection;
}

export async function deleteCollectionReq(guildDiscordId: string, collectionId: string): Promise<void> {
    await authJson(`/api/v1/guilds/${guildDiscordId}/collections/${collectionId}`, { method: 'DELETE' });
}

export async function guildStatus(guildDiscordId: string): Promise<GuildStatusResponse | null> {
    try {
        return await authJson<GuildStatusResponse>(`/api/v1/guilds/${guildDiscordId}/status`);
    } catch {
        return null;
    }
}

export async function guildStats(guildDiscordId: string): Promise<GuildStatsResponse | null> {
    try {
        return await authJson<GuildStatsResponse>(`/api/v1/guilds/${guildDiscordId}/stats`);
    } catch {
        return null;
    }
}

export async function guildRecentAlerts(guildDiscordId: string): Promise<RecentAlertRow[]> {
    try {
        const r = await authJson<{ items?: RecentAlertRow[] }>(
            `/api/v1/guilds/${guildDiscordId}/recent-alerts`,
        );
        return r.items ?? [];
    } catch {
        return [];
    }
}

export async function guildAlertChannels(guildDiscordId: string): Promise<AlertChannelRow[]> {
    try {
        const r = await authJson<{ channels?: AlertChannelRow[] }>(
            `/api/v1/guilds/${guildDiscordId}/alert-channels`,
        );
        return r.channels ?? [];
    } catch {
        return [];
    }
}

export async function putGuildAlertChannel(
    guildDiscordId: string,
    alertType: string,
    body: { discordChannelId: string; mentionRoleId?: string | null; name?: string },
): Promise<AlertChannelRow> {
    const enc = encodeURIComponent(alertType);
    const r = await authJson<{ channel?: AlertChannelRow }>(
        `/api/v1/guilds/${guildDiscordId}/alert-channels/${enc}`,
        {
            method: 'PUT',
            body: JSON.stringify(body),
        },
    );
    if (!r.channel) throw httpError(500, 'Invalid alert channel response');
    return r.channel;
}

export async function deleteGuildAlertChannel(guildDiscordId: string, alertType: string): Promise<void> {
    const enc = encodeURIComponent(alertType);
    await authJson(`/api/v1/guilds/${guildDiscordId}/alert-channels/${enc}`, {
        method: 'DELETE',
    });
}

export async function listWatchlist(): Promise<WatchlistRow[]> {
    const r = await authJson<{ items?: WatchlistRow[] }>(`/api/v1/watchlist`);
    return r.items ?? [];
}

export async function postWatchlistItem(body: {
    targetType: 'wallet' | 'collection';
    targetAddress: string;
}): Promise<WatchlistRow | null> {
    const r = await authJson<{ item?: WatchlistRow | null }>(`/api/v1/watchlist`, {
        method: 'POST',
        body: JSON.stringify(body),
    });
    return r.item ?? null;
}

export async function deleteWatchlistItem(id: string): Promise<void> {
    await authJson(`/api/v1/watchlist/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function postLogout(): Promise<void> {
    try {
        const token = readToken();
        await fetch(`${API_BASE}/api/v1/auth/logout`, {
            method: 'POST',
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                'Content-Type': 'application/json',
            },
        });
    } catch {
        /* best-effort */
    }
}

export async function disconnectDiscord(): Promise<void> {
    await postLogout();
    clearSessionStorage();
    window.location.replace('/');
}

export function extractTokenFromUrl(): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    if (tokenFromUrl) {
        persistToken(tokenFromUrl);
        window.history.replaceState({}, document.title, window.location.pathname);
        return tokenFromUrl;
    }
    return null;
}
