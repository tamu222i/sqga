import { PlayerProfile, PlayerProfileSchema } from '../../domain/schemas/index.ts';

const STORAGE_KEY = 'roblox_asmr_squishy_player_profile_v1';

export const DEFAULT_PLAYER_PROFILE: PlayerProfile = {
  coins: 800,
  delightPoints: 0,
  inventory: [
    {
      itemId: 'bakery_toast',
      obtainedAt: Date.now() - 3600000,
      squishCount: 12,
      isFavorite: true,
      level: 1,
    },
  ],
  pityCounters: {},
  shelfItemIds: ['bakery_toast'],
  soundSettings: {
    volume: 0.85,
    bassBoost: true,
    haptic: true,
  },
};

export class LocalStorageRepository {
  public static loadProfile(): PlayerProfile {
    try {
      const serialized = localStorage.getItem(STORAGE_KEY);
      if (!serialized) {
        return DEFAULT_PLAYER_PROFILE;
      }
      const rawData = JSON.parse(serialized);
      const parsed = PlayerProfileSchema.safeParse(rawData);
      if (parsed.success) {
        return parsed.data;
      }
      console.warn('Invalid player profile schema in storage, falling back to default:', parsed.error);
      return DEFAULT_PLAYER_PROFILE;
    } catch (e) {
      console.error('Failed to load profile from localStorage:', e);
      return DEFAULT_PLAYER_PROFILE;
    }
  }

  public static saveProfile(profile: PlayerProfile): void {
    try {
      // Validate schema before persisting
      const validated = PlayerProfileSchema.parse(profile);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validated));
    } catch (e) {
      console.error('Failed to save validated profile to localStorage:', e);
    }
  }

  public static resetProfile(): PlayerProfile {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to reset profile:', e);
    }
    return DEFAULT_PLAYER_PROFILE;
  }
}
