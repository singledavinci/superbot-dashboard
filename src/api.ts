// API client for SuperBot dashboard
export const API_BASE = import.meta.env.VITE_API_URL || 'https://superbot-backend-production.up.railway.app';

export const BUILD_SHA = import.meta.env.VITE_GIT_SHA || 'unknown';

export type ApiHttpError = Error & { status: number };

export function createApiHttpError(message: string, status: number): ApiHttpError {
    const err = new Error(message) as ApiHttpError;
    err.status = status;
    return err;
}

export function isApiHttpError(e: unknown): e is ApiHttpError {
    return e instanceof Error && typeof (e as { status?: unknown }).status === 'number';
}

const ACTIVE_GUILD_KEY = 'superbot_active_guild';
const ELIGIBLE_GUILDS_KEY = 'superbot_eligible_guild_ids';

function authHeaders(): Record<string, string> {
    const token = localStorage.getItem('superbot_token');
    const base: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) base['Authorization'] = `Bearer ${token}`;
    return base;
}

/** Remember selected Discord guild for multi-server operators. */
export function persistActiveGuildId(guildDiscordId: string) {
    localStorage.setItem(ACTIVE_GUILD_KEY, guildDiscordId);
}

export function readStoredActiveGuildId(): string | null {
    return localStorage.getItem(ACTIVE_GUILD_KEY);
}

export function persistEligibleGuildIds(ids: string[]) {
    try {
        localStorage.setItem(ELIGIBLE_GUILDS_KEY, JSON.stringify(ids));
    } catch {
        /* ignore quota */
    }
}

export function readStoredEligibleGuildIds(): string[] {
    try {
        const raw = localStorage.getItem(ELIGIBLE_GUILDS_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as unknown;
        if (!Array.isArray(parsed)) return [];
        return parsed.filter((id): id is string => typeof id === 'string' && id.trim().length > 0);
    } catch {
        return [];
    }
}

function discordLoginUrl() {
    return `${API_BASE}/api/v1/auth/discord`;
}

/** Clears local session and sends the user through Discord OAuth. */
export function clearSessionAndRedirectToLogin() {
    localStorage.removeItem('superbot_token');
    localStorage.removeItem(ACTIVE_GUILD_KEY);
    localStorage.removeItem(ELIGIBLE_GUILDS_KEY);
    window.location.replace(discordLoginUrl());
}

export async function throwIfNotOk(res: Response): Promise<void> {
    if (res.ok) return;

    const hadToken = !!localStorage.getItem('superbot_token');
    if ((res.status === 401 || res.status === 403) && hadToken) {
        clearSessionAndRedirectToLogin();
        throw createApiHttpError(
            `Server returned ${res.status}: ${res.statusText || 'Error'}`,
            res.status,
        );
    }

    let detail = `Server returned ${res.status}: ${res.statusText || 'Error'}`;
    try {
        const parsed = (await res.clone().json()) as { error?: unknown };
        if (typeof parsed?.error === 'string' && parsed.error.trim()) {
            detail = parsed.error.trim();
        }
    } catch {
        /* use status line */
    }
    throw createApiHttpError(detail, res.status);
}

export async function fetchJsonWithAuth<T>(url: string): Promise<T> {
    const res = await fetch(url, { headers: authHeaders() });
    await throwIfNotOk(res);
    return res.json() as Promise<T>;
}

export async function fetchRules(guildId: string) {
    return fetchJsonWithAuth(`${API_BASE}/api/v1/guilds/${guildId}/rules`);
}

export async function addWallet(guildId: string, address: string, label: string, alertChannelId?: string) {
    const res = await fetch(`${API_BASE}/api/v1/guilds/${guildId}/wallets`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ address, label, alertChannelId }),
    });
    await throwIfNotOk(res);
    return res.json() as Promise<{ success?: boolean; wallet?: Record<string, unknown> }>;
}

export async function deleteWallet(guildId: string, walletId: string) {
    const res = await fetch(`${API_BASE}/api/v1/guilds/${guildId}/wallets/${walletId}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    await throwIfNotOk(res);
    return res.json();
}

export async function addCollection(guildId: string, contract: string, name: string, floorAlertPct?: number, alertChannelId?: string) {
    const res = await fetch(`${API_BASE}/api/v1/guilds/${guildId}/collections`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ contract, name, floorAlertPct, alertChannelId }),
    });
    await throwIfNotOk(res);
    return res.json() as Promise<{ success?: boolean; collection?: Record<string, unknown> }>;
}

export async function deleteCollection(guildId: string, collectionId: string) {
    const res = await fetch(`${API_BASE}/api/v1/guilds/${guildId}/collections/${collectionId}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    await throwIfNotOk(res);
    return res.json();
}

export async function fetchWallets(guildId: string) {
    return fetchJsonWithAuth(`${API_BASE}/api/v1/guilds/${guildId}/wallets`);
}

export async function fetchCollections(guildId: string) {
    return fetchJsonWithAuth(`${API_BASE}/api/v1/guilds/${guildId}/collections`);
}

export async function fetchStatus() {
    const res = await fetch(`${API_BASE}/api/health`);
    return res.json();
}

export async function fetchGuildStatus(guildId: string) {
    return fetchJsonWithAuth(`${API_BASE}/api/v1/guilds/${guildId}/status`);
}

/** Clear JWT, drop cached guild choice, optionally notify backend, then reload the app shell. */
export async function disconnectDiscord() {
    try {
        await fetch(`${API_BASE}/api/v1/auth/logout`, { method: 'POST', headers: { ...authHeaders() } });
    } catch {
        /* stateless logout is fine */
    }
    localStorage.removeItem('superbot_token');
    localStorage.removeItem(ACTIVE_GUILD_KEY);
    localStorage.removeItem(ELIGIBLE_GUILDS_KEY);
    window.location.replace('/');
}
