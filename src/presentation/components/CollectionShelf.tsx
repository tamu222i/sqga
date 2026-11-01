import React, { useState } from 'react';
import { InventoryEntry, SquishyItem, Rarity } from '../../domain/schemas/index.ts';
import { SQUISHY_CATALOG_MAP } from '../../domain/model/catalog.ts';
import { SquishySvgRenderer } from './SquishySvgRenderer.tsx';
import { asmrAudio } from '../../infrastructure/audio/WebAudioAsmrEngine.ts';
import { Sparkles, Heart, Award, Volume2, Check } from 'lucide-react';

interface CollectionShelfProps {
  inventory: InventoryEntry[];
  activeItemId: string;
  onSelectActiveItem: (itemId: string) => void;
  onDelightEarned: (delight: number, coins: number) => void;
}

export const CollectionShelf: React.FC<CollectionShelfProps> = ({
  inventory,
  activeItemId,
  onSelectActiveItem,
  onDelightEarned,
}) => {
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [bouncingItemId, setBouncingItemId] = useState<string | null>(null);

  const inventoryMap = new Map<string, InventoryEntry>(
    inventory.map((e) => [e.itemId, e])
  );

  const catalogItems = Object.values(SQUISHY_CATALOG_MAP);

  // Filter items
  const filteredItems = catalogItems.filter((item) => {
    if (filterRarity === 'all') return true;
    return item.rarity === filterRarity;
  });

  const unlockedCount = inventory.length;
  const totalCount = catalogItems.length;

  const handleShelfItemTap = (item: SquishyItem, isUnlocked: boolean) => {
    if (!isUnlocked) {
      asmrAudio.playFoilCrinkle(0.2);
      return;
    }

    setBouncingItemId(item.id);
    onSelectActiveItem(item.id);

    // Play its ASMR sound
    if (item.primarySound === 'foam_sigh') asmrAudio.playFoamSigh(0.7);
    else if (item.primarySound === 'gel_squeak') asmrAudio.playGelSqueak(0.7);
    else if (item.primarySound === 'slime_pop') asmrAudio.playSlimePop(0.7);
    else if (item.primarySound === 'acrylic_tap') asmrAudio.playAcrylicTap();
    else asmrAudio.playMochiSquelch(0.7);

    onDelightEarned(5, 1);

    setTimeout(() => {
      setBouncingItemId(null);
    }, 300);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* Header & Stats */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 px-2">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
            <span>🧸 スクイーズ図鑑・ディスプレー棚</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            タップして触感ASMR音を聴いたり、プレイグラウンドにセットしてじっくり揉もう！
          </p>
        </div>

        {/* Collection ratio */}
        <div className="px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs flex items-center gap-2">
          <span className="text-slate-400">コレクション進捗:</span>
          <span className="font-bold text-amber-400 font-mono-numbers">
            {unlockedCount} / {totalCount}
          </span>
          <span className="text-xs text-slate-500 font-mono-numbers">
            ({Math.round((unlockedCount / totalCount) * 100)}%)
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="w-full flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-none">
        {['all', 'common', 'rare', 'epic', 'legendary', 'mythic'].map((r) => {
          const isActive = filterRarity === r;
          const labelMap: Record<string, string> = {
            all: '全種類',
            common: 'Common',
            rare: 'Rare',
            epic: 'Epic',
            legendary: 'Legendary',
            mythic: 'Mythic Secret',
          };
          return (
            <button
              key={r}
              onClick={() => {
                asmrAudio.playAcrylicTap();
                setFilterRarity(r);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700/80'
              }`}
            >
              {labelMap[r]}
            </button>
          );
        })}
      </div>

      {/* Shelf Grid */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {filteredItems.map((item) => {
          const userEntry = inventoryMap.get(item.id);
          const isUnlocked = !!userEntry;
          const isActive = item.id === activeItemId;
          const isBouncing = bouncingItemId === item.id;

          return (
            <div
              key={item.id}
              onClick={() => handleShelfItemTap(item, isUnlocked)}
              className={`relative flex flex-col items-center justify-between p-3 rounded-2xl border-2 transition-all select-none cursor-pointer roblox-box-shadow ${
                isActive
                  ? 'bg-slate-800/95 border-amber-400 ring-2 ring-amber-400/40'
                  : isUnlocked
                  ? 'bg-slate-800/80 border-slate-700 hover:border-slate-500 hover:bg-slate-700/80'
                  : 'bg-slate-900/40 border-slate-800 opacity-50 cursor-not-allowed'
              } ${isBouncing ? 'scale-95' : 'hover:scale-[1.02]'}`}
            >
              {/* Active selection badge */}
              {isActive && (
                <div className="absolute top-2 right-2 p-1 bg-amber-400 rounded-full text-slate-950 shadow-sm z-10">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}

              {/* Rarity Micro Label */}
              <div className="w-full flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span className="uppercase tracking-wider">{item.rarity}</span>
                {isUnlocked && (
                  <span className="font-mono-numbers text-amber-400 font-semibold">
                    Lv.{userEntry.level}
                  </span>
                )}
              </div>

              {/* Squishy Model / Silhouette */}
              <div className="w-28 h-28 my-1 flex items-center justify-center">
                {isUnlocked ? (
                  <div className="w-24 h-24 flex items-center justify-center transform scale-75">
                    <SquishySvgRenderer
                      item={item}
                      deformationX={0}
                      deformationY={0}
                      squishDepth={isBouncing ? 0.6 : 0}
                      wobble={isBouncing ? 0.4 : 0}
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-slate-800/80 border border-dashed border-slate-700 flex items-center justify-center text-2xl text-slate-600">
                    ❓
                  </div>
                )}
              </div>

              {/* Info Label */}
              <div className="w-full text-center mt-1">
                <div className="text-xs font-bold text-white truncate">
                  {isUnlocked ? item.japaneseName : '？？？（未発見）'}
                </div>
                {isUnlocked ? (
                  <div className="text-[11px] text-emerald-400 mt-0.5 truncate flex items-center justify-center gap-1">
                    <Volume2 className="w-3 h-3" />
                    <span>{item.primarySound}</span>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    ガチャで解放しよう
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
