import type { Database } from './database.generated';

type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

// Reward claim tables
export type UserRewardClaim = Tables<'user_reward_claims'>;
export type UserRewardClaimInsert = TablesInsert<'user_reward_claims'>;
export type UserRewardClaimUpdate = TablesUpdate<'user_reward_claims'>;

export type PartnerRewardConfig = Tables<'partner_reward_configs'>;
export type UserRewardTracking = Tables<'user_reward_tracking'>;

// User & partner tables
export type User = Tables<'users'>;
export type LicensedAccount = Tables<'licensed_accounts'>;
