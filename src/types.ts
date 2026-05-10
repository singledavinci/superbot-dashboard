export type RuleType = 'wallet' | 'collection' | 'global' | string;

export interface Rule {
  id: string;
  type: RuleType;
  target?: string | null;
  channelId?: string | null;
  status?: 'Active' | 'Paused' | string | null;
}

export interface Wallet {
  id?: string;
  address: string;
  label?: string | null;
  chain?: string | null;
  channelId?: string | null;
}

export interface Collection {
  id?: string;
  name: string;
  contractAddress: string;
  chain?: string | null;
  channelId?: string | null;
}

export interface AuthMeResponse {
  userId?: string | null;
  id?: string | null;
  username?: string | null;
  guildId?: string | null;
  /** Discord snowflakes the JWT may manage (slash-free API scope). May be empty. */
  eligibleGuildIds?: string[];
  jwtIssuedAt?: string | null;
  gitSha?: string | null;
  requiresReauth?: boolean;
}

export interface RulesResponse {
  rules?: Rule[];
}

export interface WalletsResponse {
  wallets?: Wallet[];
}

export interface CollectionsResponse {
  collections?: Collection[];
}

export interface GuildStatusResponse {
  plan?: string | null;
  channels?: number;
  wallets?: number;
  collections?: number;
}
