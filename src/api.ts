// API client for SuperBot dashboard
export const API_BASE = import.meta.env.VITE_API_URL || 'https://superbot-backend-production.up.railway.app';

export type ApiHttpError = Error & { status: number };

export function createApiHttpError(message: string, status: number): ApiHttpError {
    const err = new Error(message) as ApiHttpError;
    err.status = status;
    return err;
}

export function isApiHttpError(e: unknown): e is ApiHttpError {
    return e instanceof Error && typeof (e as { status?: unknown }).status === 'number';
}

function authHeaders(): Record<string, string> {
    const token = localStorage.getItem('superbot_token');
    const base: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) base['Authorization'] = `Bearer ${token}`;
    return base;
}

async function throwIfNotOk(res: Response, fallback: string): Promise<void> {
    if (res.ok) return;
    let detail = fallback;
    try {
        const parsed = await res.clone().json() as { error?: unknown };
        if (typeof parsed?.error === 'string' && parsed.error.trim()) {
            detail = parsed.error.trim();
        }
    } catch {
        /* ignore non-JSON error bodies */
    }
    throw createApiHttpError(detail, res.status);
}

export async function fetchRules(guildId: string) {
    const res = await fetch(`${API_BASE}/api/v1/guilds/${guildId}/rules`, { headers: authHeaders() });
    await throwIfNotOk(res, 'Failed to fetch rules');
    return res.json();
}

export async function addWallet(guildId: string, address: string, label: string, alertChannelId?: string) {
    const res = await fetch(`${API_BASE}/api/v1/guilds/${guildId}/wallets`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ address, label, alertChannelId }),
    });
    await throwIfNotOk(res, 'Failed to add wallet');
    return res.json() as Promise<{ success?: boolean; wallet?: Record<string, unknown> }>;
}

export async function deleteWallet(guildId: string, walletId: string) {
    const res = await fetch(`${API_BASE}/api/v1/guilds/${guildId}/wallets/${walletId}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    await throwIfNotOk(res, 'Failed to delete wallet');
    return res.json();
}

export async function addCollection(guildId: string, contract: string, name: string, floorAlertPct?: number, alertChannelId?: string) {
    const res = await fetch(`${API_BASE}/api/v1/guilds/${guildId}/collections`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ contract, name, floorAlertPct, alertChannelId }),
    });
    await throwIfNotOk(res, 'Failed to add collection');
    return res.json() as Promise<{ success?: boolean; collection?: Record<string, unknown> }>;
}

export async function deleteCollection(guildId: string, collectionId: string) {
    const res = await fetch(`${API_BASE}/api/v1/guilds/${guildId}/collections/${collectionId}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    await throwIfNotOk(res, 'Failed to delete collection');
    return res.json();
}

export async function fetchWallets(guildId: string) {
    const res = await fetch(`${API_BASE}/api/v1/guilds/${guildId}/wallets`, { headers: authHeaders() });
    await throwIfNotOk(res, 'Failed to fetch wallets');
    return res.json();
}

export async function fetchCollections(guildId: string) {
    const res = await fetch(`${API_BASE}/api/v1/guilds/${guildId}/collections`, { headers: authHeaders() });
    await throwIfNotOk(res, 'Failed to fetch collections');
    return res.json();
}

export async function fetchStatus() {
    const res = await fetch(`${API_BASE}/api/health`);
    return res.json();
}

export async function fetchGuildStatus(guildId: string) {
    const res = await fetch(`${API_BASE}/api/v1/guilds/${guildId}/status`, { headers: authHeaders() });
    await throwIfNotOk(res, 'Failed to fetch guild status');
    return res.json();
}

const ACTIVE_GUILD_KEY = 'superbot_active_guild';

/** Remember selected Discord guild for multi-server operators. */
export function persistActiveGuildId(guildDiscordId: string) {
    localStorage.setItem(ACTIVE_GUILD_KEY, guildDiscordId);
}

export function readStoredActiveGuildId(): string | null {
    return localStorage.getItem(ACTIVE_GUILD_KEY);
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
    window.location.replace('/');
}
