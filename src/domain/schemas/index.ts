import { z } from 'zod';

export const RaritySchema = z.enum(['common', 'rare', 'epic', 'legendary', 'mythic']);
export type Rarity = z.infer<typeof RaritySchema>;

export const MaterialTypeSchema = z.enum([
  'memory_foam',    // Slow-rise, soft whoosh, deep squish
  'water_gel',      // Springy, squeaky, jelly bounce
  'crunchy_floam',  // Slime with foam micro-beads, crisp crackles
  'mochi_elastic',  // Ultra-stretch, soft thud, supple rebound
]);
export type MaterialType = z.infer<typeof MaterialTypeSchema>;

export const SoundTypeSchema = z.enum([
  'foam_sigh',
  'gel_squeak',
  'slime_pop',
  'mochi_squelch',
  'acrylic_tap',
]);
export type SoundType = z.infer<typeof SoundTypeSchema>;

export const IconShapeSchema = z.enum([
  'bear',
  'cat',
  'panda',
  'boba',
  'toast',
  'slime',
  'alien',
  'capybara',
  'shiba',
  'donut',
]);
export type IconShape = z.infer<typeof IconShapeSchema>;

export const SquishyItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  japaneseName: z.string(),
  description: z.string(),
  rarity: RaritySchema,
  material: MaterialTypeSchema,
  primarySound: SoundTypeSchema,
  reboundSpeed: z.number().min(0.02).max(1.0), // 0.08 = very slow-rise, 0.8 = fast spring
  softness: z.number().min(0.1).max(1.0),     // How easily it deforms
  color: z.string(),
  accentColor: z.string(),
  iconShape: IconShapeSchema,
  texturePattern: z.enum(['smooth', 'sparkle', 'beads', 'swirl']),
  basePrice: z.number().nonnegative(),
});
export type SquishyItem = z.infer<typeof SquishyItemSchema>;

export const BannerDropItemSchema = z.object({
  itemId: z.string(),
  weight: z.number().positive(),
});
export type BannerDropItem = z.infer<typeof BannerDropItemSchema>;

export const GachaBannerSchema = z.object({
  id: z.string(),
  name: z.string(),
  japaneseName: z.string(),
  subtitle: z.string(),
  cost: z.number().positive(),
  dropPool: z.array(BannerDropItemSchema),
  pityThreshold: z.number().positive(), // e.g. 10 pulls guarantees Rare+
  themeColor: z.string(),
  bagColor: z.string(),
  bagPattern: z.string(),
});
export type GachaBanner = z.infer<typeof GachaBannerSchema>;

export const InventoryEntrySchema = z.object({
  itemId: z.string(),
  obtainedAt: z.number(),
  squishCount: z.number().default(0),
  isFavorite: z.boolean().default(false),
  level: z.number().default(1),
});
export type InventoryEntry = z.infer<typeof InventoryEntrySchema>;

export const PlayerProfileSchema = z.object({
  coins: z.number().default(500),
  delightPoints: z.number().default(0),
  inventory: z.array(InventoryEntrySchema).default([]),
  pityCounters: z.record(z.string(), z.number()).default({}),
  shelfItemIds: z.array(z.string()).default([]),
  soundSettings: z.object({
    volume: z.number().min(0).max(1).default(0.85),
    bassBoost: z.boolean().default(true),
    haptic: z.boolean().default(true),
  }).default({
    volume: 0.85,
    bassBoost: true,
    haptic: true,
  }),
});
export type PlayerProfile = z.infer<typeof PlayerProfileSchema>;
