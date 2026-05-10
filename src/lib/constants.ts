/** Alert types configurable via `AlertChannel` rows (global guild routing). */
export const DASHBOARD_ALERT_TYPES = [
    'WHALE_BUY',
    'WHALE_SALE',
    'WHALE_MINT',
    'SWEEP',
    'CLUSTER_BUY',
    'MASS_LISTING',
    'MASS_DELIST',
    'FLOOR_IMPACT_FOLLOWUP',
    'HOT_MINT',
    'FLOOR_RISE',
    'FLOOR_DROP',
    'MINT_RADAR',
] as const;

export type DashboardAlertType = (typeof DASHBOARD_ALERT_TYPES)[number];

/** Collection-scoped delivery: worker/indexer primarily uses per-collection `alertChannelId`. */
export const COLLECTION_SCOPED_ALERT_TYPES = [
    'SWEEP',
    'MASS_LISTING',
    'MASS_DELIST',
    'FLOOR_DROP',
    'FLOOR_RISE',
    'HOT_MINT',
] as const;
