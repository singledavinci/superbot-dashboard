// API client for SuperBot dashboard
const API_BASE = import.meta.env.VITE_API_URL || 'https://superbot-backend-production.up.railway.app';

function authHeaders(): Record<string, string> {
    const token = localStorage.getItem('superbot_token');
    const base: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) base['Authorization'] = `Bearer ${token}`;
    return base;
}

export async function fetchRules(guildId: string) {
    const res = await fetch(`${API_BASE}/api/v1/guilds/${guildId}/rules`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch rules');
    return res.json();
}

export async function addWallet(guildId: string, address: string, label: string, alertChannelId?: string) {
    const res = await fetch(`${API_BASE}/api/v1/guilds/${guildId}/wallets`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ address, label, alertChannelId }),
    });
    if (!res.ok) throw new Error('Failed to add wallet');
    return res.json();
}

export async function deleteWallet(guildId: string, walletId: string) {
    const res = await fetch(`${API_BASE}/api/v1/guilds/${guildId}/wallets/${walletId}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete wallet');
    return res.json();
}

export async function addCollection(guildId: string, contract: string, name: string, floorAlertPct?: number, alertChannelId?: string) {
    const res = await fetch(`${API_BASE}/api/v1/guilds/${guildId}/collections`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ contract, name, floorAlertPct, alertChannelId }),
    });
    if (!res.ok) throw new Error('Failed to add collection');
    return res.json();
}

export async function deleteCollection(guildId: string, collectionId: string) {
    const res = await fetch(`${API_BASE}/api/v1/guilds/${guildId}/collections/${collectionId}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete collection');
    return res.json();
}

export async function fetchWallets(guildId: string) {
    const res = await fetch(`${API_BASE}/api/v1/guilds/${guildId}/wallets`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch wallets');
    return res.json();
}

export async function fetchCollections(guildId: string) {
    const res = await fetch(`${API_BASE}/api/v1/guilds/${guildId}/collections`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch collections');
    return res.json();
}

export async function fetchStatus() {
    const res = await fetch(`${API_BASE}/api/health`);
    return res.json();
}
