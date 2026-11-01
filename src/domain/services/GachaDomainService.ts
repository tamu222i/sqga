import { GachaBanner, SquishyItem, Rarity, InventoryEntry } from '../schemas/index.ts';
import { SQUISHY_CATALOG_MAP } from '../model/catalog.ts';

export interface PullResultItem {
  item: SquishyItem;
  isNew: boolean;
  wasPityGuaranteed: boolean;
  previousLevel: number;
  newLevel: number;
}

export interface GachaExecutionResult {
  results: PullResultItem[];
  coinsSpent: number;
  updatedPityCount: number;
  newInventory: InventoryEntry[];
}

export class GachaDomainService {
  /**
   * Performs a single or multi pull on a specified banner
   */
  public static executePull(
    banner: GachaBanner,
    pullCount: 1 | 10,
    currentInventory: InventoryEntry[],
    currentPity: number,
    rng: () => number = Math.random
  ): GachaExecutionResult {
    const results: PullResultItem[] = [];
    let pityCounter = currentPity;
    const inventoryMap = new Map<string, InventoryEntry>(
      currentInventory.map((entry) => [entry.itemId, { ...entry }])
    );

    for (let i = 0; i < pullCount; i++) {
      pityCounter += 1;
      const isPityTriggered = pityCounter >= banner.pityThreshold;

      // Filter pool if pity is triggered
      let candidatePool = banner.dropPool;
      if (isPityTriggered) {
        // Pity: guaranteed Rare, Epic, Legendary, or Mythic
        const rareOrAbovePool = banner.dropPool.filter((dp) => {
          const item = SQUISHY_CATALOG_MAP[dp.itemId];
          return item && item.rarity !== 'common';
        });
        if (rareOrAbovePool.length > 0) {
          candidatePool = rareOrAbovePool;
        }
      }

      // Weighted random selection
      const selectedItemId = this.selectWeightedItem(candidatePool, rng);
      const squishy = SQUISHY_CATALOG_MAP[selectedItemId];

      if (!squishy) {
        throw new Error(`Item ${selectedItemId} not found in catalog`);
      }

      // Check if rare/above resets pity
      const isHighTier = ['rare', 'epic', 'legendary', 'mythic'].includes(squishy.rarity);
      if (isHighTier || isPityTriggered) {
        pityCounter = 0;
      }

      // Inventory check
      const existing = inventoryMap.get(squishy.id);
      const isNew = !existing;
      const previousLevel = existing ? existing.level : 0;
      const newLevel = existing ? existing.level + 1 : 1;

      if (existing) {
        existing.level = newLevel;
      } else {
        inventoryMap.set(squishy.id, {
          itemId: squishy.id,
          obtainedAt: Date.now(),
          squishCount: 0,
          isFavorite: false,
          level: 1,
        });
      }

      results.push({
        item: squishy,
        isNew,
        wasPityGuaranteed: isPityTriggered,
        previousLevel,
        newLevel,
      });
    }

    return {
      results,
      coinsSpent: banner.cost * pullCount,
      updatedPityCount: pityCounter,
      newInventory: Array.from(inventoryMap.values()),
    };
  }

  private static selectWeightedItem(
    pool: { itemId: string; weight: number }[],
    rng: () => number
  ): string {
    const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
    let randomVal = rng() * totalWeight;

    for (const item of pool) {
      if (randomVal < item.weight) {
        return item.itemId;
      }
      randomVal -= item.weight;
    }

    return pool[pool.length - 1].itemId;
  }

  /**
   * Calculate delight points earned when squishing an item
   */
  public static calculateSquishDelight(squishy: SquishyItem, force: number, level: number = 1): number {
    const rarityMultiplier: Record<Rarity, number> = {
      common: 1,
      rare: 2,
      epic: 4,
      legendary: 8,
      mythic: 20,
    };

    const multiplier = rarityMultiplier[squishy.rarity] || 1;
    const base = Math.round(force * 5 * multiplier);
    const levelBonus = 1 + (level - 1) * 0.15;
    return Math.max(1, Math.round(base * levelBonus));
  }
}
