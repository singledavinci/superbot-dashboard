export interface AuthMeResponse {
    userId?: string | null;
    username?: string | null;
    guildId?: string | null;
    eligibleGuildIds?: string[];
    eligibleGuildSummaries?: { id: string; name: string }[];
    jwtIssuedAt?: string | null;
    gitSha?: string | null;
    requiresReauth?: boolean;
}

export interface GuildStatusResponse {
    plan?: string | null;
    channels?: number;
    wallets?: number;
    collections?: number;
}

export interface GuildStatsResponse {
    wallets: number;
    collections: number;
    alertsLast24h: number;
    deliveredTodayByType: Record<string, number>;
}

export interface RecentAlertRow {
    id: string;
    alertType: string;
    status: string;
    channelId: string;
    eventId: string;
    createdAt: string;
    error?: string | null;
}

export interface WatchedWallet {
    id?: string;
    address: string;
    label?: string | null;
    alertChannelId?: string | null;
    mentionRoleId?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface TrackedCollection {
    id?: string;
    contractAddress: string;
    name: string;
    chain?: string | null;
    floorAlertPct?: number | null;
    floorRiseAlertPct?: number | null;
    sweepThresholdNative?: number | null;
    massListingThreshold?: number | null;
    hotMintEnabled?: boolean;
    hotMintChannelId?: string | null;
    delistAlertEnabled?: boolean;
    delistChannelId?: string | null;
    alertChannelId?: string | null;
    mentionRoleId?: string | null;
    createdAt?: string;
}

export interface AlertChannelRow {
    id: string;
    guildId: string;
    discordChannelId: string;
    name: string;
    alertType: string;
    mentionRoleId?: string | null;
}

export interface WatchlistRow {
    id: string;
    userId: string;
    targetType: string;
    targetAddress: string;
    createdAt: string;
}
