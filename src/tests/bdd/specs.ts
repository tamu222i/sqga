import { BddFeature, BddScenarioResult, BddScenarioContext } from './bddEngine.ts';
import { GachaDomainService } from '../../domain/services/GachaDomainService.ts';
import { GACHA_BANNERS } from '../../domain/model/banners.ts';
import { SQUISHY_CATALOG_MAP } from '../../domain/model/catalog.ts';
import { PlayerProfileSchema, SquishyItemSchema } from '../../domain/schemas/index.ts';

export const BDD_FEATURES: BddFeature[] = [
  {
    name: 'Feature: ガチャ確率 & 天井保証 (Gacha Pity & Guarantee System)',
    description: 'プレイヤーが不利益を被らないよう、天井到達時に高レアリティスクイーズが確定排出され、天井がリセットされること',
    scenarios: [
      {
        title: '天井直前(Pity Threshold - 1)の状態でガチャを引いたとき、天井が発動してRare以上が確定する',
        run: async (ctx: BddScenarioContext) => {
          let banner = GACHA_BANNERS[0];
          let currentPity = 0;
          let inventory: { itemId: string; obtainedAt: number; squishCount: number; isFavorite: boolean; level: number }[] = [];
          let result: ReturnType<typeof GachaDomainService.executePull> | null = null;

          await ctx.given('天井カウンターが9（閾値10の直前）で所持品が空のプレイヤー', () => {
            banner = GACHA_BANNERS[0]; // pityThreshold = 10
            currentPity = 9;
            inventory = [];
          });

          await ctx.when('単発ガチャ(1回)を実行したとき', () => {
            result = GachaDomainService.executePull(banner, 1, inventory, currentPity);
          });

          await ctx.then('天井保証(wasPityGuaranteed)がtrueとなり、Rare以上のスクイーズが排出され、天井がリセット(0)される', () => {
            if (!result) throw new Error('Result was not generated');
            const pull = result.results[0];
            if (!pull.wasPityGuaranteed) {
              throw new Error('Expected wasPityGuaranteed to be true');
            }
            const rarity = pull.item.rarity;
            if (rarity === 'common') {
              throw new Error(`Expected Rare or higher, but got ${rarity}`);
            }
            if (result.updatedPityCount !== 0) {
              throw new Error(`Expected updatedPityCount to reset to 0, got ${result.updatedPityCount}`);
            }
          });
        },
      },
      {
        title: '10連ガチャを実行したとき、排出品がインベントリに追加され消費コインが正しく計算される',
        run: async (ctx: BddScenarioContext) => {
          const banner = GACHA_BANNERS[0];
          let result: ReturnType<typeof GachaDomainService.executePull> | null = null;

          await ctx.given('コスト100コインのベーカリーガチャ', () => {
            if (banner.cost !== 100) throw new Error('Banner cost mismatch');
          });

          await ctx.when('10連ガチャを実行したとき', () => {
            result = GachaDomainService.executePull(banner, 10, [], 0);
          });

          await ctx.then('10個のアイテムが排出され、消費コインは1000コインとなる', () => {
            if (!result) throw new Error('Result missing');
            if (result.results.length !== 10) {
              throw new Error(`Expected 10 items, got ${result.results.length}`);
            }
            if (result.coinsSpent !== 1000) {
              throw new Error(`Expected 1000 coins spent, got ${result.coinsSpent}`);
            }
            if (result.newInventory.length === 0) {
              throw new Error('Inventory should contain obtained items');
            }
          });
        },
      },
    ],
  },
  {
    name: 'Feature: スクイーズ重複とレベルアップ集約 (Inventory Aggregation)',
    description: '同一スクイーズを再度獲得した際、インベントリが肥大化せず、レベルアップしてスクイーズ効能が向上すること',
    scenarios: [
      {
        title: 'すでに所持しているスクイーズを引いたとき、新規フラグはfalseでレベルが+1される',
        run: async (ctx: BddScenarioContext) => {
          const banner = GACHA_BANNERS[0];
          const initialInventory = [
            {
              itemId: 'bakery_toast',
              obtainedAt: Date.now() - 5000,
              squishCount: 5,
              isFavorite: true,
              level: 1,
            },
          ];
          let result: ReturnType<typeof GachaDomainService.executePull> | null = null;

          await ctx.given('「とろけるバタートースト(Level 1)」を所持しているプレイヤー', () => {
            if (initialInventory[0].level !== 1) throw new Error('Initial level must be 1');
          });

          await ctx.when('強制的にバタートーストが排出されたとき（モックRNGでtoastを引く）', () => {
            // RNG that picks the first pool item (toast)
            const mockRng = () => 0.01;
            result = GachaDomainService.executePull(banner, 1, initialInventory, 0, mockRng);
          });

          await ctx.then('排出結果のisNewはfalseとなり、newLevelが2に上昇してインベントリが更新される', () => {
            if (!result) throw new Error('No result');
            const pull = result.results[0];
            if (pull.item.id !== 'bakery_toast') {
              throw new Error(`Expected bakery_toast, got ${pull.item.id}`);
            }
            if (pull.isNew !== false) {
              throw new Error('Expected isNew to be false for duplicate item');
            }
            if (pull.newLevel !== 2) {
              throw new Error(`Expected level 2, got ${pull.newLevel}`);
            }
            const updatedEntry = result.newInventory.find((e) => e.itemId === 'bakery_toast');
            if (!updatedEntry || updatedEntry.level !== 2) {
              throw new Error('Updated inventory does not reflect level 2');
            }
          });
        },
      },
    ],
  },
  {
    name: 'Feature: ASMR快感スコア (Delight Points) ドメイン計算',
    description: 'スクイーズのレアリティとレベル、押した力(Force)に応じた快感ポイントが正確に計算されること',
    scenarios: [
      {
        title: '神話級(Mythic)スクイーズを最大圧力で揉み込んだとき、適切な倍率ボーナスが付与される',
        run: async (ctx: BddScenarioContext) => {
          const mythic = SQUISHY_CATALOG_MAP['mythic_golden_tofu_god'];
          let delightPoints = 0;

          await ctx.given('神話級(Mythic)の「黄金の神トーフ」スクイーズ（Level 1）', () => {
            if (!mythic || mythic.rarity !== 'mythic') throw new Error('Invalid mythic squishy');
          });

          await ctx.when('強圧(force = 1.0)でスクイーズを実行したとき', () => {
            delightPoints = GachaDomainService.calculateSquishDelight(mythic, 1.0, 1);
          });

          await ctx.then('快感ポイントが計算され、Common(5点)を大幅に上回るボーナス点(100点)が得られる', () => {
            if (delightPoints < 90) {
              throw new Error(`Expected at least 90 delight points, got ${delightPoints}`);
            }
          });
        },
      },
    ],
  },
  {
    name: 'Feature: スキーマ駆動バリデーション (Zod Schema Validation)',
    description: '不正なデータ構造や範囲外の値がドメインモデルに混入するのを未然に防ぐこと',
    scenarios: [
      {
        title: 'カタログ内の全スクイーズがZodスキーマ定義に完全準拠している',
        run: async (ctx: BddScenarioContext) => {
          await ctx.given('すべてのカタログアイテム', () => {
            if (Object.keys(SQUISHY_CATALOG_MAP).length === 0) throw new Error('Catalog is empty');
          });

          await ctx.when('SquishyItemSchemaで全アイテムを検証したとき', () => {
            for (const item of Object.values(SQUISHY_CATALOG_MAP)) {
              const res = SquishyItemSchema.safeParse(item);
              if (!res.success) {
                throw new Error(`Item ${item.id} failed schema validation: ${res.error.message}`);
              }
            }
          });

          await ctx.then('エラーが0件ですべてのプロパティ（反発速度、素材、レアリティ）が有効である', () => {
            // Passed with zero throws
          });
        },
      },
      {
        title: '不正なプレイヤーステータス（マイナスコイン等）を安全に拒絶する',
        run: async (ctx: BddScenarioContext) => {
          let parseSuccess = false;

          await ctx.given('不正なデータ（coinsが文字列、ボリュームが範囲外など）', () => {
            // ready
          });

          await ctx.when('PlayerProfileSchemaで検証したとき', () => {
            const invalidData = {
              coins: 'one million', // should be number
              soundSettings: {
                volume: 99.9, // max is 1.0
              },
            };
            const res = PlayerProfileSchema.safeParse(invalidData);
            parseSuccess = res.success;
          });

          await ctx.then('検証に失敗し、安全なフォールバック状態を保持できる', () => {
            if (parseSuccess) {
              throw new Error('Expected validation to fail for malformed player data');
            }
          });
        },
      },
    ],
  },
];

export async function runAllBddFeatures(): Promise<BddScenarioResult[]> {
  const results: BddScenarioResult[] = [];
  for (const feature of BDD_FEATURES) {
    for (const scenario of feature.scenarios) {
      const ctx = new BddScenarioContext();
      let passed = true;
      try {
        await scenario.run(ctx);
      } catch {
        passed = false;
      }
      results.push({
        title: scenario.title,
        featureName: feature.name,
        passed,
        steps: ctx.steps,
      });
    }
  }
  return results;
}
