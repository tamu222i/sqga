import { GachaBanner } from '../schemas/index.ts';

export const GACHA_BANNERS: GachaBanner[] = [
  {
    id: 'banner_sweet_bakery',
    name: 'Sweet Bakery & Cafe',
    japaneseName: 'ふんわり焼きたてベーカリー',
    subtitle: '低反発パン・トースト・もちもち点心コレクション',
    cost: 100,
    pityThreshold: 10,
    themeColor: '#ea580c', // Warm amber orange
    bagColor: '#ffedd5',
    bagPattern: 'checker',
    dropPool: [
      { itemId: 'bakery_toast', weight: 40 },
      { itemId: 'strawberry_donut', weight: 35 },
      { itemId: 'cozy_shiba', weight: 25 },
      { itemId: 'sleepy_panda_bun', weight: 12 },
      { itemId: 'sakura_mochi_kitty', weight: 4 },
      { itemId: 'divine_slow_rise_capybara', weight: 1 },
    ],
  },
  {
    id: 'banner_crunchy_aqua',
    name: 'Slime & Aqua Drops',
    japaneseName: 'ザクザクスライム＆アクアジェル',
    subtitle: '気泡がパチパチ弾けるビーズ＆ぷるぷるジェル',
    cost: 150,
    pityThreshold: 10,
    themeColor: '#0284c7', // Sky cyan
    bagColor: '#e0f2fe',
    bagPattern: 'bubbles',
    dropPool: [
      { itemId: 'green_slime_blob', weight: 45 },
      { itemId: 'boba_milk_cat', weight: 30 },
      { itemId: 'neon_cyber_bear', weight: 18 },
      { itemId: 'galaxy_alien_crunch', weight: 6 },
      { itemId: 'neon_aurora_crystal', weight: 2 },
    ],
  },
  {
    id: 'banner_cyber_galaxy',
    name: 'Cyber Neon & Space',
    japaneseName: '電脳ネオン＆銀河ディメンション',
    subtitle: 'アクリル爪タップ音と宇宙ラメの結晶',
    cost: 250,
    pityThreshold: 12,
    themeColor: '#7c3aed', // Neon purple
    bagColor: '#f3e8ff',
    bagPattern: 'grid',
    dropPool: [
      { itemId: 'neon_cyber_bear', weight: 40 },
      { itemId: 'sleepy_panda_bun', weight: 25 },
      { itemId: 'galaxy_alien_crunch', weight: 18 },
      { itemId: 'neon_aurora_crystal', weight: 6 },
      { itemId: 'mythic_golden_tofu_god', weight: 1 },
    ],
  },
  {
    id: 'banner_mythic_vault',
    name: 'Roblox Mythic Secret Vault',
    japaneseName: '【秘宝】神託の黄金ヴォールト',
    subtitle: '伝説の神トーフ・極楽カピバラを封入した至高の金袋',
    cost: 500,
    pityThreshold: 8,
    themeColor: '#ca8a04', // Gold
    bagColor: '#fef9c3',
    bagPattern: 'stripes',
    dropPool: [
      { itemId: 'sakura_mochi_kitty', weight: 30 },
      { itemId: 'galaxy_alien_crunch', weight: 30 },
      { itemId: 'divine_slow_rise_capybara', weight: 20 },
      { itemId: 'neon_aurora_crystal', weight: 15 },
      { itemId: 'mythic_golden_tofu_god', weight: 5 },
    ],
  },
];

export const GACHA_BANNER_MAP: Record<string, GachaBanner> = Object.fromEntries(
  GACHA_BANNERS.map((banner) => [banner.id, banner])
);
